# Awais HR — Workflow Refactor Plan
## Phase 0 Audit Results: Current Workflow State

> **Status**: Audit Complete. No code changed yet.  
> **Last Audited**: 2026-10-06

---

## 1. Executive Summary of Current Workflow State

The application currently has **no formal workflow engine**. Each module implements its own ad-hoc status field mutations. There is no:
- State machine enforcement (invalid transitions are not blocked)
- Central workflow definition or configuration
- Multi-step approval chains
- Timeout/escalation
- Proper audit trail of state changes
- Idempotency protection on approval actions

---

## 2. Module-by-Module Current Workflow Audit

### 2.1 Leave Management — `leave_request`

**Current DB Schema (`V4__Enterprise_HR_Suite.sql`):**
```sql
leave_request (
    id, employee_id, leave_policy_id,
    start_date, end_date, reason,
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
    approved_by VARCHAR(50)
)
```

**Current State Transitions:**
```
(no draft state)
→ PENDING (on submit)
→ APPROVED (direct mutation)
→ REJECTED (direct mutation)
```

**What's Working:**
- ✅ Self-approval prevention in `LeaveServiceImpl.updateRequestStatus()`
- ✅ Manager-only approval enforcement (`canApproveLeave()`)
- ✅ Soft delete via `deleted = TRUE` flag
- ✅ Leave balance check against `leave_policy.allowance` before submit

**What's Missing:**
- ❌ No `DRAFT` state — employees cannot save drafts before submitting
- ❌ No `WITHDRAWN` state — employees cannot retract a pending request
- ❌ No `CANCELLED` state after approval (cancellation should reverse balance)
- ❌ No balance deduction transaction on approval — balance is calculated on-the-fly from `SUM(DATEDIFF)`, which is correct but has no transactional record
- ❌ No `leave_balance_transactions` table for audit trail
- ❌ No multi-step workflow (LINE_MANAGER → HR_MANAGER)
- ❌ No timeout/escalation
- ❌ No workflow state validation (APPROVED leave can be re-approved with no error)
- ❌ Deletion endpoint (`DELETE /requests/{id}`) has no ownership or state check

**Target State Machine:**
```
DRAFT → SUBMITTED → PENDING_LINE_MANAGER → PENDING_HR_MANAGER → APPROVED → COMPLETED
                                         ↘ REJECTED
                 ↘ WITHDRAWN (by employee, before approval)
                                         ↘ CANCELLED (after approval, reverses balance)
```

---

### 2.2 Expense Management — `expense_claim`

**Current DB Schema (`V5__Remaining_Enterprise_HR_Suite.sql`):**
```sql
expense_claim (
    id, employee_id, amount, description,
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
    receipt_url
)
```

**Current State Transitions:**
```
(no draft)
→ PENDING (on submit)
→ APPROVED (if amount ≤ $500 by any authenticated user, or > $500 by SUPER_ADMIN only)
→ REJECTED
```

**Critical Issues Found:**
- ❌ `approveExpense()` checks for `SUPER_ADMIN` via `isSuperAdmin()` — but `FINANCE_ADMIN` and `LINE_MANAGER` have no approval rights in the current code
- ❌ Hard-coded `$500.00` threshold — should be configurable per-tenant
- ❌ No role validation for who can approve amounts ≤ $500 — any authenticated user can approve
- ❌ No multi-tier workflow (LINE_MANAGER → FINANCE_ADMIN → payment)
- ❌ No `PAID` / `PAYMENT_PENDING` state
- ❌ No `receipt_url` column in `V5` schema but used in service code (added in a later migration)

**Target State Machine:**
```
DRAFT → SUBMITTED → MANAGER_REVIEW → FINANCE_REVIEW → APPROVED → PAYMENT_PENDING → PAID
                                ↘ REJECTED          ↘ REJECTED
CANCELLED (before PAYMENT_PENDING)
```

---

### 2.3 Payroll — `payslip` / `salary_structure`

**Current DB Schema (`V5__Remaining_Enterprise_HR_Suite.sql`):**
```sql
salary_structure (id, employee_id, basic_salary, allowance, deductions)

payslip (
    id, employee_id, pay_period, net_salary,
    status VARCHAR(20) DEFAULT 'UNPAID'   -- UNPAID | PAID
)
```

**Current Behavior (`PayrollServiceImpl.java`):**
- `runPayroll(email)` — computes salary and immediately inserts a payslip with `status = 'PAID'`
- `getAllPayslips()` — returns all employees' payslips with NO authorization check
- `getPayslips(email)` — returns own payslips; if none exist, auto-generates one

**Critical Issues:**
- ❌ `runPayroll()` has zero authorization check — any employee can call it
- ❌ `getAllPayslips()` exposes company-wide salary data to any authenticated user
- ❌ Payslip is created as `PAID` instantly — no CALCULATING, REVIEWED, APPROVED, LOCKED states
- ❌ No maker-checker pattern — one person calculates and "pays" in the same action
- ❌ `maker_checker_request` table exists (V52) but no service code implements it
- ❌ No payroll run concept (period-based, not individual)
- ❌ Salary can be changed directly in `salary_structure` with no history or approval

**Target State Machine:**
```
DRAFT → CALCULATING → CALCULATED → READY_FOR_REVIEW → REVIEWED → APPROVED → LOCKED
→ DISBURSEMENT_CREATED → PAYMENT_PROCESSING → PAID
             ↘ PAYMENT_FAILED (retryable)
```

---

### 2.4 Employee Lifecycle & Exit Clearance

**Current DB Schema:**
```sql
employee (status: ACTIVE | INVITED | PROBATION | TERMINATED)

employee_timeline (id, employee_id, type, description, effective_date)
-- types: PROMOTION, TRANSFER, CONFIRMATION

exit_clearance (
    id, employee_id,
    department_approved BOOLEAN DEFAULT FALSE,
    it_approved BOOLEAN DEFAULT FALSE,
    finance_approved BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'PENDING'
)

resignation (id, employee_id, resignation_date, last_working_date, reason, status)
```

**Current Behavior:**
- Lifecycle events are recorded in `employee_timeline` — good for history, but no state enforcement
- `exit_clearance` uses 3 boolean columns — not a proper state machine; no ordering enforced
- `approveClearance()` uses string concatenation for column name — **SQL injection risk**
- `resignation.status = 'PENDING'` only — no further transitions implemented

**Target Lifecycle State Machine:**
```
CANDIDATE → OFFERED → OFFER_ACCEPTED → PRE_ONBOARDING → ONBOARDING → PROBATION
→ ACTIVE → TRANSFER/PROMOTION (back to ACTIVE) → RESIGNATION → NOTICE_PERIOD
→ OFFBOARDING → TERMINATED
```

**Offboarding Sub-workflow (replacing boolean flags):**
```
INITIATED → HR_PROCESSING → MANAGER_CLEARANCE → IT_ASSET_RETURN
→ FINANCE_CLEARANCE → BENEFITS_CLOSURE → FINAL_SETTLEMENT
→ EXIT_INTERVIEW → ACCESS_REVOCATION → COMPLETED
```

---

### 2.5 Recruitment — `candidate_application`

**Current DB Schema:**
```sql
job_requisition (id, title, description, status: OPEN | CLOSED, openings, salary_range)

candidate_application (
    id, job_id, first_name, last_name, email, resume_url,
    status_stage VARCHAR(30) DEFAULT 'APPLIED',
    applied_at
)
-- status_stage values: APPLIED, SCREENED, SHORTLISTED, INTERVIEW, EVALUATION, etc.
```

**Current Behavior:**
- Stages tracked in `status_stage` — no formal state machine
- No authorization: any authenticated user can move any candidate through stages
- No job requisition approval workflow before publishing
- No offer letter state
- V46 (`V46__Interview_Offer.sql`) adds interview and offer tracking

**Target Recruitment State Machine:**
```
JOB_DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED

Candidate:
APPLIED → SCREENING → SHORTLISTED → INTERVIEW_SCHEDULED
→ EVALUATION → HR_REVIEW → OFFER_EXTENDED → OFFER_ACCEPTED
→ PRE_ONBOARDING → HIRED
           ↘ REJECTED (at any stage)
           ↘ WITHDRAWN (candidate self-withdrawal)
```

---

### 2.6 Performance — `performance_goal`

**Current DB Schema:**
```sql
performance_goal (id, employee_id, title, target_value, current_value,
                  status: IN_PROGRESS | COMPLETED | CANCELLED)
```

**Finding**: No formal review cycle. No self-appraisal, no manager review, no 360 feedback state machine. `performance_goal` is a simple record with manual updates.

**Target State Machine:**
```
CYCLE_DRAFT → CYCLE_OPEN → SELF_REVIEW → MANAGER_REVIEW → 360_FEEDBACK
→ CALIBRATION → FINALIZED → ACKNOWLEDGED → CYCLE_CLOSED
```

---

### 2.7 Approval Delegation — `approval_delegation`

**Current DB Schema (V41):**
```sql
approval_delegation (
    id, delegator_email, delegatee_email,
    reason TEXT, status VARCHAR(30) DEFAULT 'ACTIVE', created_at
)
```

**Finding**: Table exists, but no service implementation found for it. No controller reads or writes delegation records during approval flows. The delegation model is also incomplete — missing `start_date`, `end_date`, `module_scope`.

---

### 2.8 Maker-Checker Request — `maker_checker_request`

**Current DB Schema (V52):**
```sql
maker_checker_request (
    id, request_type, maker_employee_id, checker_employee_id,
    entity_id, change_payload, status, requested_at, actioned_at
)
-- request_type: SALARY_REVISION | BANK_DISBURSEMENT | ROLE_PROMOTION
```

**Finding**: Table exists with correct design. No service implementation found. This is the right foundation for salary and payroll maker-checker.

---

### 2.9 Audit Center — `enterprise_audit_log`

**Current DB Schema (V47):**
```sql
enterprise_audit_log (
    id, actor_email, action_type, entity_name, entity_id,
    details TEXT, ip_address, performed_at
)
-- action_type: CREATE | UPDATE | DELETE | EXPORT
```

**Finding**: Table exists. Missing fields: `tenant_id`, `old_value`, `new_value`, `user_agent`, `correlation_id`, `reason`. No service code writes to this table in any module currently.

---

## 3. Workflow Engine Design (Target)

### 3.1 Proposed Schema (Additive — no destructive migration)

```sql
-- New tables to ADD via V53+

-- Workflow definition (configurable per tenant)
CREATE TABLE workflow_definition (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,          -- LEAVE | EXPENSE | PAYROLL | RECRUITMENT
    entity_type VARCHAR(50) NOT NULL,
    version INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow steps
CREATE TABLE workflow_step (
    id VARCHAR(50) PRIMARY KEY,
    workflow_id VARCHAR(50) REFERENCES workflow_definition(id),
    sequence_order INT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    approver_type VARCHAR(50) NOT NULL,  -- USER | ROLE | MANAGER | HR | FINANCE | CFO | DEPARTMENT_HEAD
    approver_role VARCHAR(50),
    condition_expr TEXT,
    timeout_hours INT DEFAULT 48,
    escalation_role VARCHAR(50),
    is_required BOOLEAN DEFAULT TRUE
);

-- Workflow instance (per entity)
CREATE TABLE workflow_instance (
    id VARCHAR(50) PRIMARY KEY,
    workflow_definition_id VARCHAR(50) REFERENCES workflow_definition(id),
    entity_type VARCHAR(50) NOT NULL,    -- LEAVE_REQUEST | EXPENSE_CLAIM | PAYROLL_RUN
    entity_id VARCHAR(50) NOT NULL,
    current_step_id VARCHAR(50),
    status VARCHAR(30) NOT NULL,         -- PENDING | IN_PROGRESS | APPROVED | REJECTED | CANCELLED
    initiator_id VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE KEY (entity_type, entity_id)  -- one workflow per entity
);

-- Workflow action history
CREATE TABLE workflow_action (
    id VARCHAR(50) PRIMARY KEY,
    instance_id VARCHAR(50) REFERENCES workflow_instance(id),
    step_id VARCHAR(50) REFERENCES workflow_step(id),
    actor_id VARCHAR(50) NOT NULL,
    action VARCHAR(30) NOT NULL,         -- SUBMIT | APPROVE | REJECT | RETURN | CANCEL | WITHDRAW | DELEGATE | ESCALATE
    comment TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave balance ledger (replaces on-the-fly SUM calculation)
CREATE TABLE leave_balance_transaction (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    leave_policy_id VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,  -- CREDIT | DEBIT | REVERSAL | ADJUSTMENT
    days INT NOT NULL,
    reference_id VARCHAR(50),               -- leave_request.id
    reference_year INT NOT NULL,
    description VARCHAR(255),
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compensation history (salary change audit)
CREATE TABLE employee_compensation_history (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    basic_salary DECIMAL(15,2) NOT NULL,
    allowance DECIMAL(15,2) DEFAULT 0,
    deductions DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'PKR',
    grade VARCHAR(30),
    effective_from DATE NOT NULL,
    effective_to DATE,
    reason VARCHAR(255),
    request_id VARCHAR(50),
    approved_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced employee_role with temporal validity
-- (ALTER TABLE — additive, no data loss)
ALTER TABLE employee_role
    ADD COLUMN IF NOT EXISTS effective_from DATE,
    ADD COLUMN IF NOT EXISTS effective_until DATE,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(50),
    ADD COLUMN IF NOT EXISTS scope_type VARCHAR(30) DEFAULT 'TENANT',
    ADD COLUMN IF NOT EXISTS scope_value VARCHAR(100);
```

---

## 4. Standard Workflow Actions to Support

| Action | Who Can Use | Conditions |
|---|---|---|
| `SUBMIT` | Requester | Resource in DRAFT state |
| `APPROVE` | Assigned approver | Step not yet actioned; not self-approval |
| `REJECT` | Assigned approver | Step not yet actioned |
| `RETURN` | Approver | Send back for revision |
| `CANCEL` | Requester or HR | Before final approval |
| `WITHDRAW` | Requester only | Before any approval |
| `DELEGATE` | Approver | During active delegation window |
| `ESCALATE` | System (scheduled) | After timeout threshold |
| `REASSIGN` | HR / Admin | Any pending step |

---

## 5. Default Workflow Configurations (To Seed)

### Leave Approval Workflow
```
Step 1: Employee submits (EMPLOYEE role)
Step 2: LINE_MANAGER approves (48h timeout → escalate to DEPARTMENT_HEAD)
Step 3: HR_MANAGER approves for leaves > 5 days (24h timeout)
Final: APPROVED → balance deducted
```

### Expense Approval Workflow
```
Step 1: Employee submits
Step 2: LINE_MANAGER approves (amount ≤ configurable threshold)
Step 3: FINANCE_ADMIN approves (amount > threshold)
Step 4: CFO approves (amount > high-value threshold)
Final: APPROVED → PAYMENT_PENDING
```

### Payroll Run Workflow
```
Step 1: PAYROLL_OFFICER calculates (DRAFT → CALCULATING → CALCULATED)
Step 2: FINANCE_ADMIN reviews (REVIEWED)
Step 3: CFO approves (APPROVED → LOCKED)
Step 4: PAYROLL_OFFICER executes disbursement (PAYMENT_PROCESSING)
Final: PAID (per employee) / PAYMENT_FAILED (retryable)
```

### Salary Change Workflow (Maker-Checker)
```
Step 1: HR_MANAGER or LINE_MANAGER creates request (maker)
Step 2: HR_MANAGER reviews
Step 3: CFO / FINANCE_ADMIN approves (checker)
Final: Salary updated, compensation history entry created
```

---

## 6. Migration Strategy (Safe, Additive)

### Rule: Never Drop Existing Tables or Columns

1. **V53**: Add `workflow_definition`, `workflow_step`, `workflow_instance`, `workflow_action` tables.
2. **V54**: Add `leave_balance_transaction` table.
3. **V55**: Add `employee_compensation_history` table.
4. **V56**: `ALTER TABLE employee_role ADD COLUMN` for temporal fields (idempotent).
5. **V57**: `ALTER TABLE approval_delegation ADD COLUMN start_date, end_date, scope` (extend existing).
6. **V58**: `ALTER TABLE enterprise_audit_log ADD COLUMN tenant_id, old_value, new_value` (extend existing).
7. **Seed**: Insert default workflow definitions and steps for LEAVE, EXPENSE, PAYROLL workflows.
8. **Backfill**: Migrate existing `leave_request` records to new workflow instances (PENDING → existing workflow instance with current state).

### Do NOT Modify:
- `leave_request.status` column (keep as-is, workflow engine drives it)
- `expense_claim.status` column (keep as-is)
- `payslip.status` column (extend with new values)
- `employee_role` data (only add columns)

---

## 7. Phase Execution Checklist Template

For each phase, all of the following must pass before marking COMPLETE:

```
[ ] Database migration script created and tested
[ ] Service layer implementation complete
[ ] Controller/API endpoint secured with correct @HasPermission
[ ] Frontend UI updated to reflect workflow state
[ ] Existing functionality preserved (no regressions)
[ ] Unit tests written and passing
[ ] Integration tests passing
[ ] Positive authorization test: authorized user → 200
[ ] Negative authorization test: unauthorized user → 403
[ ] Scope test: authorized role + wrong scope → 403
[ ] Tenant isolation test: cross-tenant request → 403
[ ] Workflow state test: invalid transition → 409 Conflict
[ ] Self-approval test: requester cannot approve own request → 403
[ ] Audit event test: action recorded in enterprise_audit_log
[ ] Error handling verified: correct HTTP status codes
[ ] Documentation updated
```

---

## 8. Workflow Refactor Phase Tracker

| Phase | Module | Current State | Target | Status |
|---|---|---|---|---|
| 5 | Workflow Engine Foundation | None | DB schema + WorkflowEngineService | ⏳ PENDING |
| 7 | Leave Workflow | 2-state direct mutation | Full 7-state machine | ⏳ PENDING |
| 8 | Employee Lifecycle | Timeline events only | Central lifecycle service | ⏳ PENDING |
| 9 | Salary & Compensation | Direct salary_structure edit | Maker-Checker + history | ⏳ PENDING |
| 10 | Payroll | Instant PAID | 9-state machine | ⏳ PENDING |
| 11 | Expenses | 2-state + broken auth | 7-state multi-tier | ⏳ PENDING |
| 12 | Tasks | project/timesheet only | Full task lifecycle | ⏳ PENDING |
| 13 | Performance | Simple goal tracking | Full review cycle | ⏳ PENDING |
| 14 | Recruitment | status_stage string | Formal pipeline | ⏳ PENDING |
| 15 | Onboarding/Offboarding | Boolean clearance flags | Structured steps | ⏳ PENDING |
