# Awais HR — Full System Integration Testing (SIT) Execution Report

## Executive Summary
The **Full System Integration Testing (SIT)** suite was executed against the Awais HR engine in a clean, synthetic SIT environment representing the `demo_enterprise` multi-tenant organization. All **27 test scenarios** across 9 end-to-end business journeys passed successfully with zero P0 (Blocker) or P1 (Critical) defects.

---

## 1. Test Execution Summary

- **Total Test Scenarios Executed**: 27
- **Passed**: 27
- **Failed**: 0
- **Blocked**: 0
- **Success Rate**: 100%

### Severity Breakdown:
- **P0 (Blocker)**: 0
- **P1 (Critical)**: 0
- **P2 (Major)**: 0
- **P3 (Minor)**: 0

---

## 2. Journey Execution Results Matrix

| Scenario ID | Business Journey | Tested Functionality | Expected Result | Actual Result | Status | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-J1-01** | Recruitment | Maker-Checker Job Requisition | Proposer cannot self-approve requisition ($Maker \neq Checker$) | Requisition creator self-approval rejected (`400/403`) | **PASS** | None |
| **TC-J1-02** | ATS Pipeline | Candidate Stage Progression | Candidate moves `APPLIED` ➔ `SCREENING` ➔ `OFFER` ➔ `HIRED` | Candidate stage updated in `candidate_stage_log` | **PASS** | None |
| **TC-J1-03** | Auto-Provisioning | Employee Provisioning | `HIRED` candidate auto-creates Employee record | Employee created in `PROBATION` lifecycle state | **PASS** | None |
| **TC-J2-01** | Onboarding | Clearance Tasks | Task assignment across IT, HR, Finance, Facilities | Tasks created in `cross_dept_clearance_task` | **PASS** | None |
| **TC-J2-02** | Onboarding | Completion Guard | Incomplete clearance tasks block status transition | `PROBATION` ➔ `ACTIVE` transition blocked (`409`) | **PASS** | None |
| **TC-J2-03** | Onboarding | Status Activation | 100% clearance completion activates employee | Employee status transitioned to `ACTIVE` | **PASS** | None |
| **TC-J3-01** | Leave | Request & Balance Check | Leave request validation & atomic deduction | Request approved & ledger balance updated | **PASS** | None |
| **TC-J3-02** | Leave | Overlap Guard | Conflicting date range submission blocked | Overlapping request rejected with error message | **PASS** | None |
| **TC-J3-03** | Leave | Self-Approval Guard | Employee self-approval blocked | Self-approval attempt rejected (`403`) | **PASS** | None |
| **TC-J4-01** | Expenses | Tier 1 Claim ($\le \$500$) | Claim routes to Line Manager | Claim assigned to Line Manager approval queue | **PASS** | None |
| **TC-J4-02** | Expenses | Tier 2 Claim ($\le \$2,500$) | Claim routes to Line Manager + Finance Admin | Multi-tier approval queue assigned | **PASS** | None |
| **TC-J4-03** | Expenses | Tier 3 Claim ($> \$2,500$) | Claim routes to Line Manager + Finance + CFO | Tier 3 CFO approval queue assigned | **PASS** | None |
| **TC-J4-04** | Expenses | Self-Approval Guard | Expense submitter self-approval blocked | Self-approval rejected (`403`) | **PASS** | None |
| **TC-J5-01** | Salary Revision | Proposal & Dual Control | Revision maker cannot approve own proposal | Self-approval rejected (`Maker != Checker`) | **PASS** | None |
| **TC-J5-02** | Salary Revision | Effective Date History | Checker approval updates salary history | Snapshot logged in `employee_salary_history` | **PASS** | None |
| **TC-J6-01** | Payroll | Calculation & Snapshot | Payroll calculates using active salary snapshot | Calculations match `BigDecimal` exact totals | **PASS** | None |
| **TC-J6-02** | Payroll | Payslip Ledger | Payslip generation for active employees | Payslip records written to `payslip_ledger` | **PASS** | None |
| **TC-J6-03** | Payroll | Period Lock Guard | `LOCKED` / `DISBURSED` run blocks edits | Recalculation attempt rejected (`409`) | **PASS** | None |
| **TC-J7-01** | Performance 360 | Appraisal Cycle | Cycle moves `SELF` ➔ `PEER` ➔ `MANAGER` | Review stage updated in `appraisal_cycle_log` | **PASS** | None |
| **TC-J7-02** | Performance 360 | Rating Boundary Guard | Rating score outside $[1, 5]$ scale rejected | Invalid rating score rejected (`400`) | **PASS** | None |
| **TC-J8-01** | Tasks | Task Lifecycle | Progression `TODO` ➔ `IN_PROGRESS` ➔ `COMPLETED` | Status logged in `task_status_history` | **PASS** | None |
| **TC-J8-02** | Tasks | Scoped Permissions | Users access tasks within authorized scope | Cross-team task edit rejected (`403`) | **PASS** | None |
| **TC-J9-01** | Offboarding | Resignation Notice | Employee resignation initiates notice period | Status transitioned `ACTIVE` ➔ `NOTICE_PERIOD` | **PASS** | None |
| **TC-J9-02** | Offboarding | Clearance Guard | Pending tasks block offboarding finalization | Termination blocked (`409`) | **PASS** | None |
| **TC-J9-03** | Offboarding | Access Revocation | `TERMINATED` status invalidates login token | Post-termination JWT request rejected (`401`) | **PASS** | None |
| **TC-SEC-01**| Security | Cross-Tenant Isolation | Tenant A user accesses Tenant B resource | Cross-tenant access rejected (`403`) | **PASS** | None |
| **TC-AUD-01**| Audit | Declarative Aspect | Sensitive actions logged with PII masking | Password/JWT sanitized in `security_audit_log` | **PASS** | None |
