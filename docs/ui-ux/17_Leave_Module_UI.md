# 17 — Leave Management & Time-Off Approvals UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: HR Product Designers, Frontend Engineers, Workflow Architects
- **Cross-References**: `09_Component_Library.md`, `13_Form_Standards.md`, `16_Attendance_Module_UI.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Leave Management Module. It defines specifications for the Time-Off Balance Card Grid, Interactive Team Vacation Calendar, Multi-Level Approval Drawer, and Leave Request Modal.

---

## 2. Executive Overview

Leave management requires transparency for employees and speed for managers. Awais HR provides visual balance progress gauges, real-time team coverage conflict alerts during request submission, and one-click manager approval drawers.

---

## 3. Detailed Specifications

### 3.1 Leave Balance Gauge Card Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ VACATION TIME-OFF BALANCE CARD                                         │
├────────────────────────────────────────────────────────────────────────┤
│ 🏖️ Annual Vacation Leave                                               │
│                                                                        │
│ 18.5 Days Available  /  24.0 Total Annual Accrual                      │
│ [======================================............] (77% Remaining)  │
│                                                                        │
│ 2 Days Pending Approval  |  3.5 Days Used This Year                   │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Multi-Level Approval Drawer Workflow
- **Conflict Warning Banner**: Warns managers if multiple key team members have overlapping vacation requests (`⚠️ 3 Engineers Away on Requested Dates`).
- **One-Click Action Triggers**: Instant `[ Approve ]` or `[ Reject with Comment ]` actions directly inside the right inspector drawer.

---

## 4. Design Decisions & Rationale

- **Prevent Overlap During Submission**: When an employee submits a time-off request, the modal immediately displays a **Team Calendar Preview**, showing who else in their department is away on those dates to prevent coverage issues upfront.

---

## 5. Examples & Implementation Contracts

```jsx
// Leave Balance Progress Widget Component Contract
export function LeaveBalanceGauge({ title, remaining, total, unit = 'Days', color = 'indigo' }) {
  const percentage = Math.min(100, Math.round((remaining / total) * 100));

  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">{title}</span>
        <span className="text-xs font-semibold text-[var(--accent-primary)]">{percentage}% Remaining</span>
      </div>
      <div className="text-2xl font-extrabold text-[var(--text-primary)] mb-3">
        {remaining} <span className="text-xs font-normal text-[var(--text-muted)]">/ {total} {unit}</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-surface-l2)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--accent-primary)] transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Support Half-Day Selection**: Leave request date pickers must include explicit "First Half / Second Half" toggles for partial day absences.
- **Provide Accrual Projection Tools**: Allow employees to select a future date to estimate their available leave balance at that time.

---

## 7. Future Considerations

- **Automated Out-of-Office Email Integration**: Automatically prompting Slack status and Google Calendar out-of-office synchronization upon leave approval.
