# 38 — Component Development Guide & Radix Wrapping Patterns

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Component Authors, Frontend Engineers, UI Library Maintainers
- **Cross-References**: `09_Component_Library.md`, `29_Accessibility.md`, `39_UI_Coding_Standards.md`

---

## 1. Purpose

This document provides step-by-step developer guidelines for building, wrapping, testing, and documenting UI components in Awais HR using Radix UI, Tailwind CSS v4, and TypeScript.

---

## 2. Executive Overview

Every component in Awais HR must be accessible, responsive, type-safe, and styled strictly using registered design tokens. This guide defines standard wrapping patterns for Radix primitives, prop interface contracts, and forwarding refs.

---

## 3. Detailed Specifications

### 3.1 Standard Component Authoring Lifecycle

```
┌────────────────────────────────────────────────────────────────────────┐
│ COMPONENT AUTHORING WORKFLOW                                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Select Radix Primitive (e.g. Radix Dialog)                          │
│ 2. Define TypeScript Props Interface (extending HTML attributes)       │
│ 3. Forward Ref via `React.forwardRef`                                  │
│ 4. Apply Tailwind v4 Token Classes                                     │
│ 5. Wire ARIA Accessibility Labels & Keyboard Triggers                  │
│ 6. Add Export Contract in `components/ui/index.js`                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Mandatory `React.forwardRef` Support**: All primitive UI components must forward their DOM ref to support parent focus management, Radix portal positioning, and animation triggers.

---

## 5. Examples & Implementation Contracts

```jsx
// Radix UI Dialog Wrapper Contract Pattern
import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={`fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl animate-in zoom-in-95 ${className}`}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
        <X className="w-4 h-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';
```

---

## 6. Best Practices

- **Never Swallow Props**: Always spread `...props` to underlying DOM elements to support native event handlers (`onClick`, `onBlur`, `onKeyDown`).
- **Provide Readable `displayName`**: Always set `ComponentName.displayName` for clear React DevTools debugging.

---

## 7. Future Considerations

- **Automated Component Generator CLI**: Custom scaffolding script (`npm run generate-component Modal`) creating TypeScript templates, styles, and test files.
