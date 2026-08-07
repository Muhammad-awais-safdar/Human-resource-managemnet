# 13 — Form Architecture, Validation & Multi-Step Wizard Standards

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Form Developers, Frontend Architects, QA Specialists
- **Cross-References**: `09_Component_Library.md`, `15_Employee_Module_UI.md`, `18_Payroll_Module_UI.md`

---

## 1. Purpose

This document defines form standards for Awais HR. Built with **React Hook Form** and **Zod**, it details validation rules, field layout grids, multi-step wizard navigation, auto-save indicators, and error message patterns.

---

## 2. Executive Overview

Forms in enterprise HR platforms handle critical data entries—such as employee onboarding, tax declarations, compensation updates, and job offer creation. Awais HR mandates inline validation, clear error messages, keyboard navigation support, and zero data loss through automated form state draft persistence.

---

## 3. Detailed Specifications

### 3.1 Standard Form Field Geometry & Layout Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FORM FIELD ANATOMY                              │
├────────────────────────────────────────────────────────────────────────┤
│ FIELD LABEL  [ * Required Indicator ]        [ Helper Text / Tooltip ] │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Left Icon]  INPUT VALUE TEXT               [ Clear / Eye Trigger] │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ⚠️ ERROR MESSAGE: "Tax Identification Number must be 9 digits"          │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Form Validation Behavior Rules
- **On Blur Validation**: Validate fields when focus leaves the input.
- **Real-Time Recovery Validation**: Once a field error is triggered, clear the error immediately as soon as the user types valid input.
- **Submit Shielding**: Disable submit button or show explicit inline summary when required fields are missing.

---

## 4. Design Decisions & Rationale

- **Zod Schema Driven Validation**: Form schemas are validated using Zod, ensuring type safety between frontend UI components and backend REST API contracts.
- **Auto-Saving Multi-Step Wizards**: Complex processes (e.g., 5-step Employee Onboarding) automatically save drafts to `IndexedDB` or `localStorage` after every step, preventing data loss on accidental browser refreshes.

---

## 5. Examples & Implementation Contracts

```jsx
// Enterprise Form Field with React Hook Form & Zod Contract
import React from 'react';
import { useFormContext } from 'react-hook-form';

export function FormField({ name, label, type = 'text', placeholder, required, helperText }) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between">
        <span>{label} {required && <span className="text-[var(--accent-danger)]">*</span>}</span>
        {helperText && <span className="text-[var(--text-muted)] font-normal">{helperText}</span>}
      </label>
      
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`h-9 px-3 text-sm rounded-lg bg-[var(--bg-surface-l2)] border ${
          error ? 'border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]' : 'border-[var(--border-subtle)] focus:border-[var(--accent-primary)]'
        } text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all`}
      />

      {error && <span className="text-xs text-[var(--accent-danger)] font-medium mt-0.5">{error}</span>}
    </div>
  );
}
```

---

## 6. Best Practices

- **Group Fields Logically**: Divide complex forms into 2-column or 3-column structured fieldsets with clear sub-headings.
- **Mark Required Fields Consistently**: Always indicate required fields using an asterisk (`*`) and provide explicit error messaging.

---

## 7. Future Considerations

- **AI Form Auto-Fill**: Auto-populating candidate onboarding forms directly from uploaded resume PDF files.
