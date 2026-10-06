# Awais HR — Payroll Engine Workflow & Locking Architecture

## 1. Overview

Phase 11 refactors the **Payroll Engine** into a state machine supporting **Maker-Checker Dual Control (`Maker != Checker`)**, immutable payslip ledger snapshots (`payslip_ledger`), and period locking.

---

## 2. Payroll Run State Machine

```
DRAFT ──► CALCULATED ──► UNDER_REVIEW ──► APPROVED / LOCKED ──► DISBURSED
                              │
                              └──► CANCELLED
```

- `DRAFT`: Payroll run initialized.
- `CALCULATED`: Payslips generated using exact `BigDecimal` statutory arithmetic.
- `UNDER_REVIEW`: Awaiting Maker-Checker authorization.
- `LOCKED`: Approved and locked; no further modifications or recalculations allowed.
- `DISBURSED`: Disbursed to employee bank accounts.

---

## 3. Core Security & Business Guarantees

1. **Maker-Checker Dual Control**: The user who initiates or calculates a payroll run (`initiatorEmail`) CANNOT approve or disburse it (`approverEmail`). Violations throw `IllegalArgumentException`.
2. **Payroll Locking Guard**: Locked (`LOCKED`) or disbursed (`DISBURSED`) payroll periods reject any recalculation or edit attempts (`IllegalStateException`).
3. **Immutable Ledger Snapshot**: Upon approval, employee line items are saved to `payslip_ledger` for audit and tax reporting.
4. **Declarative Audit**: Annotated with `@Auditable(action = "PAYROLL_RUN_INITIATE", entity = "PayrollRun")` and `@Auditable(action = "PAYROLL_RUN_APPROVE", entity = "PayrollRun")`.

---

## 4. Schema Reference (`V59__Payroll_Workflow_And_Locking.sql`)

### `payroll_run`
- `id` (VARCHAR(36) PRIMARY KEY)
- `pay_period` (VARCHAR(20) UNIQUE)
- `status` (VARCHAR(30))
- `total_employees` (INT)
- `total_gross` (DECIMAL(14,2))
- `total_tax` (DECIMAL(14,2))
- `total_deductions` (DECIMAL(14,2))
- `total_net` (DECIMAL(14,2))
- `initiated_by` (VARCHAR(100))
- `approved_by` (VARCHAR(100))
- `locked_at` (TIMESTAMP)
- `disbursed_at` (TIMESTAMP)

### `payslip_ledger`
- `id` (VARCHAR(36) PRIMARY KEY)
- `payroll_run_id` (VARCHAR(36) FOREIGN KEY)
- `employee_id` (VARCHAR(50) NOT NULL)
- `pay_period` (VARCHAR(20) NOT NULL)
- `basic_salary`, `allowance`, `gross_salary`, `tax_amount`, `deductions`, `net_salary` (DECIMAL(12,2))
- `status` (VARCHAR(30))
