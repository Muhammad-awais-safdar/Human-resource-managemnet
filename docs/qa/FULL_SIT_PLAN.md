# Awais HR — Full System Integration Testing (SIT) Plan

## 1. Executive Summary & Objective

The **Full System Integration Testing (SIT) Plan** defines the comprehensive testing strategy for Awais HR across all 12 core enterprise themes, 9 end-to-end business journeys, RBAC role boundaries, data access scopes, Maker-Checker dual control, time-bound delegations, declarative security audit ledgers, negative scenarios, and database integrity guarantees.

---

## 2. Test Environment & Synthetic Data Topology

### Organization Hierarchy: Demo Enterprise SaaS Tenant
- **Tenant ID**: `demo_enterprise`
- **Departments**: `HR`, `Finance`, `IT`, `Engineering`, `Sales`, `Facilities`

### Seeded Synthetic Users & Roles:
- **Tenant Admin**: `tenant.admin@demo-enterprise.com` (`TENANT_ADMIN`)
- **HR Manager**: `hr.manager@demo-enterprise.com` (`HR_MANAGER`)
- **Finance Admin**: `finance.admin@demo-enterprise.com` (`FINANCE_ADMIN`)
- **Recruiter**: `recruiter@demo-enterprise.com` (`RECRUITER`)
- **Auditor**: `sec.auditor@demo-enterprise.com` (`AUDITOR`)
- **Line Manager 1**: `manager.eng@demo-enterprise.com` (`LINE_MANAGER`)
- **Line Manager 2**: `manager.sales@demo-enterprise.com` (`LINE_MANAGER`)
- **Employee 1**: `dev.smith@demo-enterprise.com` (`EMPLOYEE`)
- **Employee 2**: `sales.jones@demo-enterprise.com` (`EMPLOYEE`)

---

## 3. End-to-End Business Journey Test Scenarios

### Journey 1: Recruitment ──► Employee Creation
- **TC-J1-01**: Requisition Creation & Maker-Checker Approval ($Maker \neq Checker$).
- **TC-J1-02**: ATS Candidate Progression (`APPLIED` ──► `SCREENING` ──► `OFFER` ──► `HIRED`).
- **TC-J1-03**: Auto-Provisioning Hired Candidate into Employee table under `PROBATION` state.

### Journey 2: Onboarding Clearance Engine
- **TC-J2-01**: Task Assignment across IT, HR, Finance, Facilities departments.
- **TC-J2-02**: Completion Guard: Incomplete tasks block transition `PROBATION` ──► `ACTIVE`.
- **TC-J2-03**: Full Task Completion triggers automatic transition `PROBATION` ──► `ACTIVE`.

### Journey 3: Employee ──► Leave Management
- **TC-J3-01**: Leave Request Submission with Balance Validation.
- **TC-J3-02**: Double-Booking Overlap Guard blocks conflicting leave dates.
- **TC-J3-03**: Multi-Tier Manager/HR Approval & Atomic Ledger Balance Deduction.

### Journey 4: Employee ──► Multi-Tier Expense Claims
- **TC-J4-01**: Claim submission $\le \$500$ (Routes to Tier 1 Line Manager).
- **TC-J4-02**: Claim submission $\le \$2,500$ (Routes to Tier 1 + Tier 2 Finance).
- **TC-J4-03**: Claim submission $> \$2,500$ (Routes to Tier 1 + Tier 2 + Tier 3 CFO).
- **TC-J4-04**: Self-Approval Guard blocks claim submitter from self-approving.

### Journey 5: Salary Revision ──► Payroll Engine
- **TC-J5-01**: Salary Revision Proposal by HR Maker.
- **TC-J5-02**: Dual Control: Maker attempting self-approval is rejected (`Maker != Checker`).
- **TC-J5-03**: Checker Approval & Effective Date snapshot write to `employee_salary_history`.

### Journey 6: Payroll Calculation & Period Locking
- **TC-J6-01**: Payroll Calculation using active salary snapshots & leave deductions.
- **TC-J6-02**: Payslip Ledger Generation with exact `BigDecimal` arithmetic.
- **TC-J6-03**: Payroll Locking: Transition to `LOCKED` / `DISBURSED` blocks further edits/recalculations.

### Journey 7: Performance 360 Appraisal Cycle
- **TC-J7-01**: Review Cycle Initialization (`SELF_APPRAISAL` ──► `PEER_REVIEW` ──► `MANAGER_REVIEW`).
- **TC-J7-02**: Rating Boundary Guard rejects scores outside $[1, 5]$ scale.
- **TC-J7-03**: Calibration & Finalization by HR Manager.

### Journey 8: Scoped Task Management
- **TC-J8-01**: Task Lifecycle progression (`TODO` ──► `IN_PROGRESS` ──► `IN_REVIEW` ──► `COMPLETED`).
- **TC-J8-02**: Scoped Access: Users only view/edit tasks within authorized `TEAM` / `DEPARTMENT` scope.

### Journey 9: Offboarding & Termination Security
- **TC-J9-01**: Offboarding Initiation & Resignation notice period assignment.
- **TC-J9-02**: Cross-Department Clearance Guard blocks offboarding finalization if tasks remain `PENDING`.
- **TC-J9-03**: Termination Access Revocation: Transitioning employee status to `TERMINATED` immediately invalidates JWT login and API access.

---

## 4. RBAC & Data Access Scope Matrix

| Role | Core HR | Leave | Salary | Payroll | Expense | Task | Performance | ATS | Audit | Admin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EMPLOYEE` | `SELF` | `SELF` | `SELF` | `SELF` | `SELF` | `SELF` | `SELF` | DENY | DENY | DENY |
| `LINE_MANAGER` | `TEAM` | `TEAM` | DENY | DENY | `TEAM` | `TEAM` | `TEAM` | DENY | DENY | DENY |
| `HR_MANAGER` | `COMPANY` | `COMPANY` | `COMPANY` | `COMPANY` | DENY | `COMPANY` | `COMPANY` | `COMPANY` | DENY | DENY |
| `FINANCE_ADMIN` | DENY | DENY | `COMPANY` | `COMPANY` | `COMPANY` | DENY | DENY | DENY | DENY | DENY |
| `RECRUITER` | DENY | DENY | DENY | DENY | DENY | DENY | DENY | `COMPANY` | DENY | DENY |
| `AUDITOR` | READ | READ | READ | READ | READ | READ | READ | READ | `COMPANY` | DENY |
| `TENANT_ADMIN` | `GLOBAL` | `GLOBAL` | `GLOBAL` | `GLOBAL` | `GLOBAL` | `GLOBAL` | `GLOBAL` | `GLOBAL` | `GLOBAL` | `GLOBAL` |
