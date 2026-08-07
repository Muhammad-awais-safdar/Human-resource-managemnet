# 18 — Loading Strategies: React Suspense, Skeletons & CLS Prevention

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Performance Engineers, Frontend Architects, UI Engineers
- **Design System Cross-Reference**: `docs/ui-ux/32_Empty_Loading_Error_States.md`

---

## 1. Purpose

This document details the loading state strategies for **Awais HR**. It specifies React 19 Suspense boundaries, dimensionally matching Skeleton Loaders, micro-spinners, and Cumulative Layout Shift (CLS = 0) prevention rules.

---

## 2. Scope

This specification governs all async data loading feedback states across page transitions, data tables, stat widgets, modals, and action button submissions.

---

## 3. Standards & Loading Architecture

### 3.1 Loading Feedback Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ LOADING FEEDBACK SPECIFICATION MATRIX                                  │
├─────────────────┬──────────────────────────────────────────────────────┤
│ TRIGGER SCOPE   │ SPECIFIED LOADING PATTERN                            │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Page Routing    │ Next.js `loading.tsx` React Suspense Streaming       │
│ Table Fetching  │ Dimensionally matching table row skeletons (Pulse)   │
│ Button Trigger  │ Inline icon spinner (`Loader2`) + button disabled    │
│ Card Metrics    │ Pulse background skeleton matching stat card width   │
│ Drawer Load     │ Side-over container skeleton with tab bar headers    │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & Loading Directory

```
src/components/
├── primitives/
│   ├── Skeleton.tsx                # Base Pulse Skeleton Primitive
│   └── Spinner.tsx                 # Inline Icon Loader Spinner
└── data-display/
    └── skeletons/                  # Composite Feature Skeletons
        ├── TableSkeleton.tsx       # Data Table Skeleton Loader
        ├── StatCardSkeleton.tsx    # Dashboard Stat Card Skeleton
        └── ProfileSkeleton.tsx     # Employee Profile Drawer Skeleton
```

---

## 5. Naming Conventions

- **Skeleton Components**: Ending in `Skeleton.tsx` (e.g. `TableSkeleton.tsx`, `StatCardSkeleton.tsx`).

---

## 6. Implementation Code Contracts

```typescript
// Skeleton Primitive Component Contract (src/components/primitives/Skeleton.tsx)
import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('bg-[var(--bg-surface-l2)]/60 animate-pulse rounded-lg', className)}
      {...props}
    />
  );
}

// Composite Table Skeleton Renderer
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface-l1)] p-4 space-y-3">
      <Skeleton className="h-8 w-full mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 7. Best Practices

- **Enforce CLS = 0**: Ensure skeleton placeholders match the exact width, height, padding, and border radius of the final rendered content.
- **Use Micro Pulse Gradients**: Pulse animations should use semi-transparent background fills (`bg-[var(--bg-surface-l2)]/60 animate-pulse`).

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** stream server-rendered sections using React Suspense (`<Suspense fallback={<TableSkeleton />}>`).
- **DO** disable action buttons and display inline loading spinners during form submissions.

### Don'ts
- **DON'T** show full-screen blocking spinners when only a single card is loading data.
- **DON'T** allow skeleton animations to cause jarring layout shifts when data arrives.

---

## 9. Dependencies Reference

- `lucide-react`: `Loader2` spin icon
- Next.js 16 App Router `loading.tsx` streaming conventions

---

## 10. Implementation Notes

Skeleton loaders are automatically disabled for users who have enabled `prefers-reduced-motion` in system preferences.
