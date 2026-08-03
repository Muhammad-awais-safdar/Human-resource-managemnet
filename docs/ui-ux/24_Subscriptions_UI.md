# 24 — Subscription Catalog, Pricing & Plan Management UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Monetization Designers, SuperAdmin Engineers, Billing Specialists
- **Cross-References**: `02_Brand_Guidelines.md`, `12_Dashboard_UX.md`, `24_Subscriptions_UI.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Internal Product Plan & Subscription Management Module. It covers the Plan Builder UI, Module Add-on Matrix, Feature Toggle Manager, Seat Allocation Metering, and Stripe Billing Invoices.

---

## 2. Executive Overview

Awais HR features a sophisticated monetization architecture supporting Tiered Packages (Starter, Professional, Enterprise), Hidden Custom Plans, Dynamic Module Add-ons, and Per-Seat Metered Billing. The Product Management UI enables internal SaaS product managers and sales reps to build custom billing plans, toggle feature access, and manage customer contracts.

---

## 3. Detailed Specifications

### 3.1 Plan Comparison & Module Matrix Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ ENTERPRISE PLAN & SUBSCRIPTION MANAGEMENT                              │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ STARTER PLAN      │ PROFESSIONAL PLAN │ ENTERPRISE CUSTOM PLAN         │
│ $6 / seat / mo    │ $12 / seat / mo   │ Custom Quote ($24+ / seat / mo)│
├───────────────────┼───────────────────┼────────────────────────────────┤
│ ✅ Core HR        │ ✅ Core HR        │ ✅ Core HR & Multi-Entity      │
│ ✅ Attendance     │ ✅ Attendance     │ ✅ Attendance & Geofencing     │
│ ✅ Leave Mgmt     │ ✅ Leave Mgmt     │ ✅ Leave Mgmt & Accrual Rules  │
│ ❌ Payroll Engine │ ✅ Payroll Engine │ ✅ Global Payroll Engine       │
│ ❌ ATS Requisitions│ ✅ ATS (5 Jobs)  │ ✅ Unlimited ATS & Scorecards  │
│ ❌ Custom Domain  │ ❌ Custom Domain  │ ✅ Full White-Label CNAME      │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ [ Select Starter ]│ [ Current Plan ]  │ [ Contact Sales / Custom Builder]│
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### 3.2 Dynamic Module Builder & Feature Toggle Grid
- **Module Checkbox Grid**: Toggle individual module entitlement (e.g. `[x] Enable LMS`, `[x] Enable AI Copilot`).
- **Limit Sliders**: Set numerical limits (e.g., `Max Employees: 500`, `API Requests/min: 5000`).

---

## 4. Design Decisions & Rationale

- **Real-Time Seat Usage Gauges**: Visual meter bars showing active employee count versus purchased tier seat allocations (`248 / 250 Seats Used — 99% Capacity`).

---

## 5. Examples & Implementation Contracts

```jsx
// Plan Metric Meter Component Contract
export function SeatUsageMeter({ activeSeats, maxSeats }) {
  const percentage = Math.min(100, Math.round((activeSeats / maxSeats) * 100));
  const isNearLimit = percentage >= 90;

  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-[var(--text-secondary)] uppercase">Active Plan Seat Utilization</span>
        <span className={isNearLimit ? 'text-amber-400 font-bold' : 'text-[var(--accent-primary)]'}>
          {activeSeats} / {maxSeats} Seats ({percentage}%)
        </span>
      </div>
      <div className="w-full h-2.5 bg-[var(--bg-surface-l2)] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isNearLimit ? 'bg-amber-400' : 'bg-[var(--accent-primary)]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isNearLimit && (
        <p className="text-[11px] text-amber-400 mt-1">
          ⚠️ Approaching plan seat limit. Upgrade tier or add seats to avoid service disruption.
        </p>
      )}
    </div>
  );
}
```

---

## 6. Best Practices

- **Provide Transparent Invoice PDF Downloads**: Direct download links for past Stripe billing invoices with itemized tax breakdowns.
- **Warn Before Module Downgrades**: Display explicit confirmation dialogs highlighting feature data that will become inaccessible upon plan downgrade.

---

## 7. Future Considerations

- **Self-Service Expansion Add-on Store**: One-click add-on purchasing directly from the tenant billing dashboard with instant Stripe prorated charge calculation.
