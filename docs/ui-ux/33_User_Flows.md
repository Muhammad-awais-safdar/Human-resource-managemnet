# 33 — End-to-End User Journey Flows & Interaction Diagrams

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Product Managers, UX Researchers, QA Architects
- **Cross-References**: `10_Layout_System.md`, `15_Employee_Module_UI.md`, `18_Payroll_Module_UI.md`, `19_ATS_Module_UI.md`

---

## 1. Purpose

This document maps out the core end-to-end user journeys in Awais HR. It details step-by-step decision flows, modal triggers, API interaction points, and success states for primary enterprise workflows.

---

## 2. Executive Overview

Awais HR unifies complex enterprise workflows into predictable steps. This specification details 3 core user flows:
1. **Employee Onboarding Journey** (Recruitment Hire -> Profile Creation -> Document Upload -> Asset Assignment).
2. **Monthly Payroll Processing Flow** (Attendance Verification -> Deduction Audit -> Variance Review -> Bank File Export).
3. **Leave Request & Approval Flow** (Employee Submit -> Conflict Check -> Manager Approval Notification -> Balance Update).

---

## 3. Detailed Specifications

### 3.1 Flow Diagram 1: Monthly Payroll Execution Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ MONTHLY PAYROLL EXECUTION JOURNEY                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [HR Admin Starts Payroll]                                              │
│            │                                                           │
│            ▼                                                           │
│ [Step 1: Attendance Verification] ──> (Missing Hours Alert?)           │
│            │                                   │ Yes                   │
│            │ No                                ▼                       │
│            │                   [Send Reminders to Managers]            │
│            ▼                                                           │
│ [Step 2: Gross-to-Net Calculations]                                    │
│            │                                                           │
│            ▼                                                           │
│ [Step 3: Anomaly & Variance Audit] ──> (Salary Change > 15%?)          │
│            │                                   │ Yes                   │
│            │ No                                ▼                       │
│            │                   [Display Flagged Employee List]         │
│            ▼                                                           │
│ [Step 4: 2-Step Lock & Execute]                                        │
│            │                                                           │
│            ▼                                                           │
│ [Disbursement Triggered] ──> (Generate PDF Payslips & Bank ACH File)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Context Retention via Drawers**: User flows never redirect away from the primary data view; secondary steps load as slide-over drawers or modal wizards to preserve spatial context.

---

## 5. Examples & Implementation Contracts

```jsx
// Multi-Step Flow Stepper Indicator Pattern
export function FlowStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full mb-6">
      {steps.map((step, idx) => {
        const isDone = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <React.Fragment key={step.title}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isDone ? 'bg-[var(--accent-success)] text-white' :
                isCurrent ? 'bg-[var(--accent-primary)] text-white ring-4 ring-[var(--accent-primary)]/20' :
                'bg-[var(--bg-surface-l2)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={`text-xs font-semibold ${isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${isDone ? 'bg-[var(--accent-success)]' : 'bg-[var(--border-subtle)]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
```

---

## 6. Best Practices

- **Always Provide Step Back Navigation**: Allow users to return to previous steps in wizards without losing inputted form state.
- **Provide Visual Success Confirmation**: Conclude every major workflow with a success banner, summary metrics, and direct next-step triggers.

---

## 7. Future Considerations

- **Automated Workflow Recovery**: Automatically restoring unsubmitted workflow drafts if an admin's browser session crashes during multi-step forms.
