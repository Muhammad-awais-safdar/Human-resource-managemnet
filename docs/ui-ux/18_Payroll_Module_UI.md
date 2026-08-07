# 18 — Payroll Engine & Financial Calculations UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Payroll Architects, Financial UI Engineers, QA Leads
- **Cross-References**: `03_Design_Principles.md`, `13_Form_Standards.md`, `14_Table_Standards.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Payroll & Compensation Engine Module. It covers the Payroll Execution Wizard, Payslip Inspector Drawer, Variance Breakdown Summary, and Bank Export Verification.

---

## 2. Executive Overview

Payroll processing requires absolute mathematical precision, auditability, and safety against accidental disbursements. Awais HR features a 4-step payroll execution wizard with real-time gross-to-net calculations, anomaly variance detection against previous payroll runs, and secure bank file export status indicators.

---

## 3. Detailed Specifications

### 3.1 4-Step Payroll Execution Wizard Taxonomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ 4-STEP PAYROLL EXECUTION WIZARD                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [1. Attendance & Hours] ──> [2. Deductions & Tax] ──> [3. Variance] ──> [4. Execute]│
├────────────────────────────────────────────────────────────────────────┤
│ PAYROLL SUMMARY SUMMARY                                                │
│ Total Gross Payroll:  $248,500.00 USD  (Tabular Numeric)               │
│ Employer Taxes:       $ 32,150.00 USD                                  │
│ Net Pay Disbursement: $192,350.00 USD                                  │
│ Employees Included:   142 Active Staff                                 │
├────────────────────────────────────────────────────────────────────────┤
│ ⚠️ VARIANCE WARNING: 3 Employees have salary changes > 15% vs Last Month│
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Payslip Inspector Drawer Anatomy
- **Header**: Employee Name, Pay Period, Net Salary Amount in large tabular numbers.
- **Breakdown Grid**:
  - **Earnings**: Basic Salary, Housing Allowance, Performance Bonus, Overtime.
  - **Deductions**: Income Tax, Health Insurance, Pension Contribution.
- **Action Buttons**: `[ Download PDF Payslip ]`, `[ Email to Employee ]`.

---

## 4. Design Decisions & Rationale

- **2-Step Executable Lock Modal**: Executing a payroll run requires entering a 2-factor authentication code or typing `"CONFIRM PAYROLL"` to prevent accidental financial disbursements.
- **Color-Coded Variance Callouts**: Variance increases >10% highlight in amber, while new bonus entries highlight in emerald.

---

## 5. Examples & Implementation Contracts

```jsx
// Payroll Summary Metric Bar Contract
export function PayrollSummaryBar({ gross, taxes, net, employeeCount }) {
  const formatCurr = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl p-6 grid grid-cols-4 gap-6 text-center">
      <div>
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Total Gross Pay</span>
        <div className="text-xl font-extrabold text-[var(--text-primary)] font-mono tabular-nums mt-1">{formatCurr(gross)}</div>
      </div>
      <div>
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Employer Taxes</span>
        <div className="text-xl font-extrabold text-amber-400 font-mono tabular-nums mt-1">{formatCurr(taxes)}</div>
      </div>
      <div>
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Total Net Disbursement</span>
        <div className="text-xl font-extrabold text-[var(--accent-success)] font-mono tabular-nums mt-1">{formatCurr(net)}</div>
      </div>
      <div>
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Active Employees</span>
        <div className="text-xl font-extrabold text-[var(--text-primary)] font-mono tabular-nums mt-1">{employeeCount} Staff</div>
      </div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Always Mask Bank Account Numbers**: Display only the last 4 digits of employee bank account numbers (`**** **** 4892`).
- **Maintain Audit Trail Logs**: Timestamp every manual salary modification with the admin's user ID and modification reason.

---

## 7. Future Considerations

- **Multi-Currency Global Payroll Engine**: Real-time FX conversion previews for cross-border international remote workers.
