# 21 — Accessibility Implementation: WCAG 2.1 AA+, ARIA & Focus Management

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Accessibility Engineers, Frontend Architects, Compliance Auditors
- **Design System Cross-Reference**: `docs/ui-ux/29_Accessibility.md`

---

## 1. Purpose

This document specifies the accessibility standards and WAI-ARIA implementation details for **Awais HR**. It ensures 100% WCAG 2.1 AA+ compliance, screen reader compatibility, visible focus ring indicators, and keyboard navigation.

---

## 2. Scope

This specification governs all interactive elements, modal focus traps, ARIA live regions, semantic HTML elements, and contrast ratios across the application.

---

## 3. Standards & Accessibility Principles

### 3.1 Accessibility Verification Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ ACCESSIBILITY SPECIFICATION MATRIX                                     │
├─────────────────┬──────────────────────────────────────────────────────┤
│ ACCESSIBLE FEATURE│ IMPLEMENTATION SPECIFICATION                       │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Focus Ring      │ 2px solid `var(--accent-primary)` with 2px offset    │
│ Screen Readers  │ `aria-label`, `aria-expanded`, `aria-hidden` attributes│
│ Dynamic Alerts  │ `aria-live="polite"` for non-disruptive dynamic alerts│
│ Focus Trapping  │ Radix Dialog focus lock inside open modal windows    │
│ Color Contrast  │ Minimum 4.5:1 ratio for normal text; 3:1 for icons   │
│ Keyboard Nav    │ 100% operable via `Tab`, `Shift+Tab`, `Enter`, `Space`│
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & Accessibility Directory

```
src/components/
├── primitives/
│   └── VisuallyHidden.tsx          # Screen reader only text wrapper
└── shared/
    └── FocusRing.tsx               # Standardized Focus Ring Utility
```

---

## 5. Naming Conventions

- **Accessibility Components**: `VisuallyHidden.tsx`, `FocusRing.tsx`.
- **Screen Reader Class**: `.sr-only` (Tailwind utility).

---

## 6. Implementation Code Contracts

```typescript
// VisuallyHidden Accessible Component Contract (src/components/primitives/VisuallyHidden.tsx)
import React from 'react';

export interface VisuallyHiddenProps {
  children: React.ReactNode;
}

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0">
      {children}
    </span>
  );
}
```

---

## 7. Best Practices

- **Use Semantic HTML Elements**: Use `<button>`, `<nav>`, `<main>`, `<header>`, and `<aside>` rather than clickable `<div>` tags.
- **Provide Alternate Text for All Images**: Ensure all avatar icons and graphics possess descriptive `alt` attributes or `aria-hidden="true"`.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** include `focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]` on all interactive buttons and input triggers.
- **DO** test screens using screen readers (VoiceOver, NVDA, JAWS) before marking feature tasks as complete.

### Don'ts
- **DON'T** remove outline focus rings (`outline-none`) without providing a visible focus-visible alternative.
- **DON'T** use color alone to convey critical status information (always pair colors with icons or textual badges).

---

## 9. Dependencies Reference

- `@radix-ui/react-accessible-icon`: Accessible icon wrapper primitive
- `@axe-core/react`: Automated React accessibility auditing tool

---

## 10. Implementation Notes

Opening any Radix UI Dialog component automatically locks focus within the overlay frame until closed, returning focus to the trigger element on close.
