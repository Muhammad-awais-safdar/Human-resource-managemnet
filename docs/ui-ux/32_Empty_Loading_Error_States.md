# 32 — Loading Skeletons, Zero-Data & Error State Specifications

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: UI Engineers, QA Auditors, Frontend Component Authors
- **Cross-References**: `09_Component_Library.md`, `14_Table_Standards.md`, `31_Animation_Guidelines.md`

---

## 1. Purpose

This document specifies the design standards for loading skeletons, empty zero-data screens, network error boundaries, and permission denial states in Awais HR.

---

## 2. Executive Overview

Users should never encounter raw unformatted error stacks, blank screens, or sudden layout jumps during data fetching. Awais HR mandates dimensionally matching **Skeleton Loaders**, helpful **Empty State Banners**, and context-rich **Error Boundary Cards** with retry triggers.

---

## 3. Detailed Specifications

### 3.1 Skeleton & State Architecture Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ APPLICATION STATE SPECIFICATION MATRIX                                 │
├─────────────────┬──────────────────────────────────────────────────────┤
│ STATE TYPE      │ UI BEHAVIOR & DESIGN REQUIREMENTS                    │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Skeleton Loading│ Pulse animation matching exact target component width│
│ Zero-Data Empty │ Lucide Icon, Title, Explanatory Body, Primary Action │
│ Network Error   │ Alert Triangle Icon, Retry Trigger, Offline Indicator│
│ 403 Forbidden   │ Lock Icon, "Contact Tenant Admin" callout link       │
│ 404 Not Found   │ Search Icon, "Return to Dashboard" action button     │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **CLS Zero Layout Protection**: Skeleton loaders must match the precise dimensions (`height`, `width`, `padding`, `border-radius`) of the final loaded component to eliminate Cumulative Layout Shift (CLS = 0).

---

## 5. Examples & Implementation Contracts

```jsx
// Empty State Banner Component Contract
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl border-dashed">
      <div className="p-4 rounded-full bg-[var(--bg-surface-l2)] text-[var(--accent-primary)] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
```

---

## 6. Best Practices

- **Never Use Generic Error Messages**: Provide explicit guidance (e.g., *"Unable to load payroll history due to connection timeout. Please check your network."*).
- **Keep Skeleton Pulses Subtle**: Use semi-transparent pulse gradients (`bg-[var(--bg-surface-l2)]/60 animate-pulse`).

---

## 7. Future Considerations

- **Optimistic Stale-While-Revalidate Caching**: Displaying cached local data immediately with a minor background refresh indicator pill.
