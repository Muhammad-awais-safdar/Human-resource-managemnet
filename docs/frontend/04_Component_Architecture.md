# 04 — Atomic Component Architecture & Radix/shadcn Integration

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Component Authors, Frontend Engineers, UI Library Maintainers
- **Design System Cross-Reference**: `docs/ui-ux/09_Component_Library.md`, `docs/ui-ux/38_Component_Development_Guide.md`

---

## 1. Purpose

This document specifies the component hierarchy, atomic design principles, prop interface definitions, and unstyled Radix UI / shadcn component wrapping rules for **Awais HR**.

---

## 2. Scope

This architecture governs all React components created within `src/components/` and `src/modules/`. It standardizes primitive controls (Buttons, Inputs, Checkboxes, Badges) and complex composite overlays (Modals, Drawers, Dropdown Menus).

---

## 3. Standards & Component Principles

### 3.1 4-Tier Component Taxonomy
1. **Primitives (`src/components/primitives/`)**: Atomic, unstyled Radix wrappers styled with Tailwind v4 (Button, Input, Checkbox, Badge, Switch).
2. **Overlay Components (`src/components/overlay/`)**: Portaled elements handling focal tasks (Dialog, Sheet, ContextMenu, Tooltip, Toast).
3. **Data Display (`src/components/data-display/`)**: Data visualization and tabular containers (DataTable, StatCard, ChartCard, Tabs, Accordion).
4. **Domain Modules (`src/modules/*/components/`)**: Business-logic-aware widgets (PayslipDrawer, CandidateKanbanCard, ClockInWidget).

---

## 4. Component Folder Taxonomy

```
src/components/
├── primitives/
│   ├── Button.tsx                  # Atomic Button
│   ├── Input.tsx                   # Text Input Field
│   ├── Checkbox.tsx                # Accessible Checkbox
│   ├── Badge.tsx                   # Status Pill Badge
│   └── Switch.tsx                  # Toggle Switch
├── overlay/
│   ├── Dialog.tsx                  # Modal Window Portal
│   ├── Sheet.tsx                   # Slide-Over Inspector Sheet
│   ├── Tooltip.tsx                 # Hover Tooltip Container
│   └── DropdownMenu.tsx            # Action Context Menu
└── data-display/
    ├── StatWidget.tsx              # Dashboard Metric Card
    ├── DataTable.tsx               # TanStack Table Container
    └── StatusBadge.tsx             # Domain Status Indicator Pill
```

---

## 5. Naming Conventions

- **Component Files**: PascalCase matching exports (e.g. `Button.tsx`, `StatWidget.tsx`).
- **Interfaces**: Component name + `Props` (e.g. `ButtonProps`, `StatWidgetProps`).
- **Sub-components**: Prefixed with parent component name (e.g. `DialogTitle`, `DialogContent`).

---

## 6. Implementation Code Contracts

```typescript
// Radix UI Dialog Component Architecture Contract (src/components/overlay/Dialog.tsx)
import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  containerClassName?: string;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, containerClassName, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl animate-in zoom-in-95',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
DialogContent.displayName = 'DialogContent';
```

---

## 7. Best Practices

- **Wrap Accessible Primitives**: Always build overlays on top of Radix UI primitives to ensure full keyboard navigation (`Tab`, `Escape`) and ARIA roles out of the box.
- **Forward Ref by Default**: All primitive components must forward their DOM ref to support tooltips, focus management, and animation libraries.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** use `cn()` utility to cleanly merge default Tailwind classes with component consumer `className` overrides.
- **DO** export compound sub-components (`DialogHeader`, `DialogFooter`) alongside the main parent export.

### Don'ts
- **DON'T** rewrite raw keyboard event listeners when Radix primitives handle ARIA accessibility natively.
- **DON'T** expose internal component state if it can be controlled externally via props.

---

## 9. Dependencies Reference

- `@radix-ui/react-*`: Unstyled accessibility primitives
- `clsx` & `tailwind-merge`: Class string concatenation and merge utilities

---

## 10. Implementation Notes

Components must be documented with explicit prop interfaces. Every component created must support light/dark theme CSS variables without relying on hardcoded HEX values.
