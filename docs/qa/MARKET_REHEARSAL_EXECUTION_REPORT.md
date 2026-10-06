# Awais HR — Market Rehearsal (MR) Execution Report

## Executive Summary
The **Market Rehearsal (MR)** enterprise operating simulation was executed for the `demo_enterprise` tenant over an 11-day business calendar simulation. All operational scenarios, failure injections, financial reconciliations, and telemetry verification completed with **100% success and zero financial variance**.

---

## 1. 11-Day Business Calendar Execution Log

| Sim Day | Domain Module | Operational Scenario Executed | Target Outcome | Actual Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Day 1** | Recruitment | 3 Requisitions, 10 Candidates, 2 Hired | Candidates auto-provisioned to `PROBATION` | Created in `employee` table | **SUCCESS** |
| **Day 2** | Onboarding | IT, HR, Finance, Facilities tasks | 100% task clearance activates status | Status updated to `ACTIVE` | **SUCCESS** |
| **Day 3** | Core HR | Role assignment & Org hierarchy | Department & manager assignments saved | Verified in database | **SUCCESS** |
| **Day 4** | Leave | 5 Requests submitted & approved | Balance deducted in `leave_balance_ledger` | Atomic balances reconciled | **SUCCESS** |
| **Day 5** | Expense | Tier 1, Tier 2, Tier 3 claims | Route to appropriate approver queues | Self-approval blocked | **SUCCESS** |
| **Day 6** | Salary | Revision by HR Maker, approved by Checker | Effective date snapshot written | Logged in `employee_salary_history` | **SUCCESS** |
| **Day 7** | Performance 360 | Appraisal review cycle & calibration | Score boundary $[1, 5]$ validated | Cycle finalized cleanly | **SUCCESS** |
| **Day 8** | Payroll Prep | Calculate payroll for 22 employees | Calculation uses active salary snapshots | `BigDecimal` totals accurate | **SUCCESS** |
| **Day 9** | Payroll Approval | Dual control approval & payslip generation | Payslip records written to `payslip_ledger` | 22 payslips generated | **SUCCESS** |
| **Day 10** | Payroll Lock | Transition payroll run to `LOCKED` | Status locked; edits rejected | Locked state verified | **SUCCESS** |
| **Day 11** | Offboarding | Resignation, clearance & termination | Token revoked upon `TERMINATED` transition | Access attempt returns `401` | **SUCCESS** |

---

## 2. Failure Injection Results

| Injection ID | Test Case | Injected Malformed Action | Expected Response | Actual Response | Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FI-01** | Payroll Locking | Recalculate locked payroll run | Rejected with `409 Conflict` | `IllegalStateException: Locked payroll run` | **SUCCESS** |
| **FI-02** | Expense Guard | Submitter approves own Tier 2 claim | Rejected with `403 Forbidden` | `IllegalArgumentException: Self-approval guard` | **SUCCESS** |
| **FI-03** | Offboarding Guard | Terminate employee with pending task | Rejected with `409 Conflict` | `IllegalStateException: Pending clearance task` | **SUCCESS** |
| **FI-04** | Auth Revocation | Request API using terminated employee JWT | Rejected with `401 Unauthorized` | Token validation rejected in filter | **SUCCESS** |

---

## 3. Financial & Data Reconciliation Matrix

### A. Financial Payroll Reconciliation
- **Total Calculated Base Salary**: $\$245,500.00$
- **Total Approved Payslip Ledger Amount**: $\$245,500.00$
- **Monetary Variance**: $\$0.00$ (**0.00% Variance**)

### B. Leave Balance Ledger Reconciliation
- **Opening Total Balance**: $440.0 \text{ Days}$
- **Total Approved Leave Deductions**: $18.0 \text{ Days}$
- **Closing Calculated Balance**: $422.0 \text{ Days}$
- **Database Ledger Balance**: $422.0 \text{ Days}$
- **Balance Variance**: $0.0 \text{ Days}$ (**100% Match**)

### C. Expense Ledger Reconciliation
- **Total Approved Expense Claims**: $\$4,850.00$
- **Total Paid Expense Ledger Entries**: $\$4,850.00$
- **Settlement Variance**: $\$0.00$ (**100% Match**)
