# Awais HR — Market Rehearsal (MR) Master Plan

## 1. Executive Summary & Objective

**Market Rehearsal (MR)** simulates one complete 11-day operating business cycle of a live enterprise SaaS customer organization (`Demo Enterprise Tenant`). MR tests real operational scenarios, failure injections, financial ledger reconciliations, and observability tracking prior to production release.

---

## 2. Simulated Customer Environment & Org Structure

- **Tenant**: `demo_enterprise`
- **Departments**: HR, Finance, IT, Engineering, Sales, Facilities
- **Users**: 1 Tenant Admin, 1 HR Manager, 1 Finance Admin, 1 Recruiter, 1 Auditor, 3 Line Managers, 20 Employees.

---

## 3. Simulated 11-Day Business Operating Calendar

```
DAY 1: RECRUITMENT ──► 3 Job Requisitions, 10 Candidates, ATS Pipeline, 2 Hired.
DAY 2: ONBOARDING  ──► IT, HR, Finance, Facilities Clearance Tasks, Status PROBATION ➔ ACTIVE.
DAY 3: CORE OPERATIONS ──► Org Chart, Role Matrix, Department Assignment.
DAY 4: LEAVE MANAGEMENT ──► 5 Leave Requests, Overlap Protection, Ledger Deductions.
DAY 5: EXPENSE CLAIMS ──► Multi-Tier Routing (Tier 1/2/3), Self-Approval Protection.
DAY 6: SALARY REVISIONS ──► HR Maker proposal, Checker approval, Effective Date Snapshot.
DAY 7: PERFORMANCE 360 ──► Review Cycles, Rating Boundary Checks (1-5), Calibration.
DAY 8: PAYROLL PREPARATION ──► Employee Eligibility, Salary Snapshot, Calculation Engine.
DAY 9: PAYROLL APPROVAL ──► Dual Control Approval, Payslip Ledger Generation.
DAY 10: PAYROLL LOCKING ──► Period Lock Transition (LOCKED/DISBURSED), Edit Attempt Rejection.
DAY 11: OFFBOARDING ──► Resignation, 100% Clearance Completion, Access Revocation.
```

---

## 4. Failure Injection Scenarios
- **FI-01: Locked Payroll Modification**: Attempting recalculation on `LOCKED` payroll run.
- **FI-02: Self-Approval Expense Claim**: Submitter attempting self-approval on Tier 2 claim.
- **FI-03: Incomplete Offboarding Clearance**: Attempting termination with pending IT clearance task.
- **FI-04: Terminated User Access**: Attempting API request using JWT of `TERMINATED` employee.

---

## 5. Financial & Data Reconciliation Strategy
- **Rec 1: Payroll Reconciliation**: Total Gross & Net Pay calculated by Payroll Engine MUST exactly equal sum of active employee salary snapshot records.
- **Rec 2: Leave Balance Reconciliation**: $\text{Closing Balance} = \text{Opening Balance} + \text{Accruals} - \text{Approved Leave}$.
- **Rec 3: Expense Settlement Reconciliation**: Total Approved Expenses MUST equal sum of paid expense ledger entries.
