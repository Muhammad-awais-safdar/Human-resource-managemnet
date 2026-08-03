# 09 — Primitive & Complex Component Library Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Frontend Engineers, Component Authors, Design System Maintainers
- **Cross-References**: `04_Color_System.md`, `06_Design_Tokens.md`, `13_Form_Standards.md`, `14_Table_Standards.md`

---

## 1. Purpose

This document provides the complete architectural specification for the Awais HR component library. Built on top of **Radix UI Primitives** and **Tailwind CSS v4** (following shadcn/ui patterns), it defines component variants, props contracts, state behaviors, and accessibility hooks for primitive and complex UI components.

---

## 2. Executive Overview

All UI elements in Awais HR derive from a unified component catalog divided into 4 tiers:
1. **Primitives**: Buttons, Inputs, Checkboxes, Switches, Badges, Tooltips.
2. **Overlay Components**: Dialogs, Modals, Slide-over Drawers, Dropdown Menus, Context Menus.
3. **Data Display Components**: Stat Cards, Data Tables, Tabs, Accordions, Timeline Logs.
4. **Feedback Components**: Skeleton Loaders, Progress Bars, Toast Alerts, Empty State Banners.

---

## 3. Detailed Specifications

### 3.1 Button Component Specification Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BUTTON COMPONENT MATRIX                         │
├─────────────┬─────────────────────────┬────────────────────────────────┤
│ VARIANT     │ STYLING SPECIFICATION   │ INTENT & USAGE                 │
├─────────────┼─────────────────────────┼────────────────────────────────┤
│ Primary     │ bg-[var(--accent-primary)] text-white hover:brightness-110│ Main action (e.g. "Save", "Submit")│
│ Secondary   │ bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)]│ Secondary action (e.g. "Filter")  │
│ Ghost       │ bg-transparent hover:bg-[var(--bg-surface-l2)]          │ Icon triggers & clean actions  │
│ Danger      │ bg-[var(--accent-danger)] text-white hover:brightness-110  │ Destructive actions ("Delete")  │
│ Outline     │ transparent border border-[var(--accent-primary)]      │ Secondary callouts             │
└─────────────┴─────────────────────────┴────────────────────────────────┘
```

#### Button Props Contract:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

### 3.2 Inspector Drawer (Slide-Over Sheet) Specification
- **Placement**: Fixed right side, `100vh` height.
- **Width**: `480px` default (Desktop), `640px` (Wide Detail), `100vw` (Mobile).
- **Z-Index Layer**: `z-50` with high-blur backdrop (`backdrop-filter: blur(12px)`).
- **Keyboard Handling**: Pressing `Escape` closes drawer; focus trapped inside while open.

---

## 4. Design Decisions & Rationale

- **Radix UI Unstyled Accessibility Core**: Building on top of Radix UI primitives ensures full keyboard navigation (`Tab`, `Arrow` keys), focus management, ARIA attributes, and portal rendering out of the box.
- **Strict Single-Tone Hover Transitions**: Hover states use CSS brightness or background tint shifts (`var(--bg-surface-l2)`), avoiding jarring layout or border jumps.

---

## 5. Examples & Implementation Contracts

```jsx
// Enterprise Button Component Implementation Pattern
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] disabled:opacity-50 disabled:pointer-events-none select-none';

  const variantStyles = {
    primary: 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] shadow-sm',
    secondary: 'bg-[var(--bg-surface-l2)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-l3)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]',
    danger: 'bg-[var(--accent-danger)] text-white hover:opacity-90 shadow-sm',
    outline: 'bg-transparent border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-base gap-2.5',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
});
Button.displayName = 'Button';
```

---

## 6. Best Practices

- **Never Omit Disabled Tooltips**: When a button is disabled, provide a parent tooltip explaining *why* it is disabled (e.g., "Requires Payroll Admin Permission").
- **Maintain Touch Target Minimums**: All interactive triggers must have an explicit visual or padding click target of at least `36px` x `36px`.

---

## 7. Future Considerations

- **Storybook 8 Visual Catalog Integration**: Automated visual regression testing suite for all primitive components across Dark and Light modes.
