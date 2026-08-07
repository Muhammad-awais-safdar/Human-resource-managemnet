# 25 — Pure Utility Functions & Formatter Library Guide

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Core Developers, Utility Authors, Frontend Engineers
- **Design System Cross-Reference**: `docs/ui-ux/05_Typography.md`, `docs/ui-ux/39_UI_Coding_Standards.md`

---

## 1. Purpose

This document catalogs pure utility functions and formatting helper libraries for **Awais HR**.

---

## 2. Scope

This specification governs string formatting, monetary currency conversion, date formatting, class name concatenation (`cn`), and numeric calculations across the application.

---

## 3. Standards & Pure Utilities Catalog

### 3.1 Global Pure Utility Catalog
- `cn(...inputs)`: Merges Tailwind CSS v4 classes cleanly without duplication conflicts using `clsx` and `tailwind-merge`.
- `formatCurrency(amount, currencyCode)`: Formats numbers into localized currency strings with `tabular-nums` formatting (e.g. `$14,250.00`).
- `formatDate(date, pattern)`: Wraps `date-fns` for standardized enterprise date display (`MMM dd, yyyy`).
- `maskSensitiveData(val, type)`: Masks SSN, bank numbers, or Tax IDs behind `••••` reveal toggles.
- `truncateString(str, maxLen)`: Safely truncates long strings with `...` ellipsis.

---

## 4. Folder Structure & Utilities Directory

```
src/utils/
├── cn.ts                           # Tailwind Class Name Merger
├── formatCurrency.ts               # Currency Formatter
├── formatDate.ts                   # Date Formatter (date-fns wrapper)
├── maskSensitiveData.ts            # Sensitive Data Masker
└── validateInput.ts                # Regex Helper Validations
```

---

## 5. Naming Conventions

- **Utility Files & Functions**: camelCase matching helper name (e.g. `formatCurrency.ts`).

---

## 6. Implementation Code Contracts

```typescript
// Tailwind Class Name Merger Contract (src/utils/cn.ts)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency Formatter Utility Contract (src/utils/formatCurrency.ts)
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

---

## 7. Best Practices

- **Keep Utilities Pure**: Utility functions must be pure functions with zero side effects, no DOM manipulation, and no external React hook dependencies.
- **Ensure 100% Code Coverage**: Unit test every pure utility function with Vitest.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** use `Intl.NumberFormat` for currency and decimal formatting.
- **DO** export utilities from `src/utils/index.ts`.

### Don'ts
- **DON'T** mutate input arguments passed into utility functions.
- **DON'T** duplicate formatting logic inside React component render blocks.

---

## 9. Dependencies Reference

- `clsx` & `tailwind-merge`: Tailwind class merger
- `date-fns`: Lightweight date manipulation engine

---

## 10. Implementation Notes

Utility functions are optimized for fast execution (< 1ms execution time per call) to prevent table rendering bottlenecks during bulk formatting.
