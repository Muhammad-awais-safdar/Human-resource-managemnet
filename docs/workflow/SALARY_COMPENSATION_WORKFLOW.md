# Awais HR — Salary & Compensation Workflow & History Ledger Architecture

## 1. Overview

Phase 10 implements **Salary & Compensation Workflow Refactoring** with strict **Maker-Checker Dual Control (`Maker != Checker`)**, salary band enforcement, and an immutable snapshot ledger (`employee_salary_history`).

---

## 2. Core Security & Business Guarantees

1. **Maker-Checker Dual Control**: The user proposing a salary revision (`proposerEmail`) CANNOT be the user who approves or rejects the revision (`reviewerEmail`). Violations throw `IllegalArgumentException`.
2. **Immutable Compensation Ledger**: Approved salary revisions automatically update `salary_structure` and insert a permanent, unalterable snapshot entry into `employee_salary_history`.
3. **Merit Percentage Calculation**: Automatically calculates percentage increase/decrease relative to current base salary.
4. **Declarative Audit**: Tagged with `@Auditable(action = "SALARY_REVISION_PROPOSE", entity = "SalaryReview")` and `@Auditable(action = "SALARY_REVISION_ACTION", entity = "SalaryReview")`.

---

## 3. Schema Reference (`V58__Salary_Compensation_Ledger.sql`)

### `employee_salary_history`
- `id` (VARCHAR(36) PRIMARY KEY)
- `employee_id` (VARCHAR(50) NOT NULL)
- `basic_salary` (DECIMAL(12,2) NOT NULL)
- `allowance` (DECIMAL(12,2) DEFAULT 0.00)
- `deductions` (DECIMAL(12,2) DEFAULT 0.00)
- `net_salary` (DECIMAL(12,2) NOT NULL)
- `currency` (VARCHAR(10) DEFAULT 'USD')
- `effective_date` (DATE NOT NULL)
- `revision_reason` (VARCHAR(255))
- `proposed_by` (VARCHAR(100) NOT NULL)
- `approved_by` (VARCHAR(100) NOT NULL)
- `created_at` (TIMESTAMP)

---

## 4. REST APIs Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/compensation/bands` | List salary bands / compensation ranges |
| `POST` | `/api/v1/compensation/bands` | Define/update salary band |
| `GET` | `/api/v1/compensation/reviews` | List salary revision proposals |
| `POST` | `/api/v1/compensation/reviews` | Submit salary revision proposal (Proposer/Maker) |
| `PUT` | `/api/v1/compensation/reviews/{id}` | Approve or reject salary revision (Checker != Maker) |
| `GET` | `/api/v1/compensation/history/{employeeId}` | View employee compensation history ledger |
