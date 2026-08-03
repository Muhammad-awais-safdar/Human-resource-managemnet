# 10 — Form Architecture: React Hook Form, Zod & Multi-Step Wizard Engine

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Form Developers, Frontend Architects, Validation Leads
- **Design System Cross-Reference**: `docs/ui-ux/13_Form_Standards.md`

---

## 1. Purpose

This document specifies the form architecture for **Awais HR**. Built with **React Hook Form** and **Zod**, it details schema-based validation, custom field wrappers, multi-step wizard state management, and auto-save draft persistence.

---

## 2. Scope

This specification governs all form inputs, select controls, date pickers, validation error patterns, and multi-step wizard step navigation across the application.

---

## 3. Standards & Validation Rules

### 3.1 Form Validation Standard
- **Schema Validation**: All forms must define a typed Zod validation schema (`z.object({ ... })`).
- **Validation Trigger**: Validate on blur (`mode: 'onBlur'`), recover in real time as the user types (`reValidateMode: 'onChange'`).
- **Auto-Save Drafts**: Complex multi-step wizards save step state to `IndexedDB` or `localStorage` to prevent data loss.

---

## 4. Folder Structure & Form Directory

```
src/components/
├── primitives/
│   ├── FormField.tsx               # Controlled Form Field Wrapper
│   ├── TextInput.tsx               # Styled Native Input
│   ├── SelectInput.tsx             # Radix Select Control
│   └── DatePickerInput.tsx         # Date Picker Control
└── shared/
    ├── FormWizardStepper.tsx       # Wizard Step Progress Bar
    └── FormAutoSaveIndicator.tsx   # Draft Save Status Pill
```

---

## 5. Naming Conventions

- **Form Schemas**: `[feature]Schema.ts` (e.g. `onboardingSchema.ts`, `payrollRunSchema.ts`).
- **Form Components**: `[Feature]Form.tsx` (e.g. `EmployeeOnboardingForm.tsx`).

---

## 6. Implementation Code Contracts

```typescript
// React Hook Form + Zod Form Component Contract
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const employeeFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Please select a department'),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export function EmployeeForm({ onSubmit }: { onSubmit: (data: EmployeeFormValues) => void }) {
  const methods = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    mode: 'onBlur',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields rendered here */}
        <button type="submit" className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-bold text-sm">
          Save Employee
        </button>
      </form>
    </FormProvider>
  );
}
```

---

## 7. Best Practices

- **Use FormProvider**: Wrap complex forms in `FormProvider` to enable deep sub-components to access form context seamlessly without prop drilling.
- **Clear Errors Rapidly**: Clear field error messages as soon as the user corrects their input.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** export TypeScript types directly from Zod schemas using `z.infer<typeof schema>`.
- **DO** disable form submit buttons when `isSubmitting` is active to prevent duplicate API requests.

### Don'ts
- **DON'T** write ad-hoc manual validation functions; define schema rules cleanly in Zod.
- **DON'T** lose user input when moving backwards in multi-step wizards.

---

## 9. Dependencies Reference

- `react-hook-form`: `^7.51.0`
- `@hookform/resolvers`: Zod integration resolver
- `zod`: Type-safe schema validation engine

---

## 10. Implementation Notes

Form error messages render below input fields with red text (`text-[var(--accent-danger)]`) and an alert warning icon (`AlertCircle`).
