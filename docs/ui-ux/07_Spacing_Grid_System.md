# 07 — Spacing, Grid System & Display Density Modes

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: UI/UX Designers, Frontend Developers, Layout Engineers
- **Cross-References**: `06_Design_Tokens.md`, `10_Layout_System.md`, `14_Table_Standards.md`

---

## 1. Purpose

This document establishes the 4px/8px spatial grid system, container layout guidelines, breakpoint standards, and density modes (Comfortable vs. Compact) for Awais HR.

---

## 2. Executive Overview

Layout spacing in enterprise software dictates how effectively users can absorb dense data sets. Awais HR enforces a strict 4px/8px spatial scale, eliminating random padding values. To accommodate both power administrators and standard employees, the layout supports user-configurable **Density Modes** (Compact for heavy HR/Payroll data entry, Comfortable for standard ESS portal tasks).

---

## 3. Detailed Specifications

### 3.1 The 4px Base Spatial Scale Matrix

| Token | Pixels | Rem Equivalence | Primary Layout Usage |
| :--- | :--- | :--- | :--- |
| `space-1` | `4px` | `0.25rem` | Micro padding, status dot offsets |
| `space-2` | `8px` | `0.50rem` | Button horizontal gap, tag margins |
| `space-3` | `12px` | `0.75rem` | Card internal element spacing |
| `space-4` | `16px` | `1.00rem` | Form field spacing, standard padding |
| `space-6` | `24px` | `1.50rem` | Section padding, container gaps |
| `space-8` | `32px` | `2.00rem` | Page section separation |
| `space-12` | `48px` | `3.00rem` | Major dashboard grid separation |
| `space-16` | `64px` | `4.00rem` | Hero container margins |

### 3.2 Responsive Viewport Breakpoint System

```css
/* Responsive Viewport Breakpoint Contracts */
--breakpoint-sm: 640px;   /* Mobile Devices / Compact Drawers */
--breakpoint-md: 768px;   /* Tablets / Dual Pane Sidebars */
--breakpoint-lg: 1024px;  /* Desktop Workspaces / Full Sidebar */
--breakpoint-xl: 1280px;  /* Large Desktop Displays */
--breakpoint-2xl: 1536px; /* Ultra-Wide Multi-Column Workspaces */
```

### 3.3 Density Mode Metric Specifications

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DENSITY MODES MATRIX                            │
├───────────────────────────────┬──────────────────┬─────────────────────┤
│ UI ELEMENT METRIC             │ COMFORTABLE MODE │ COMPACT DENSE MODE  │
├───────────────────────────────┼──────────────────┼─────────────────────┤
│ Table Row Height              │ 48px             │ 36px                │
│ Table Cell Vertical Padding   │ 12px (space-3)   │ 6px                 │
│ Form Input Height             │ 40px             │ 32px                │
│ Sidebar Nav Item Padding      │ 10px 14px        │ 6px 10px            │
│ Card Container Padding        │ 24px (space-6)   │ 16px (space-4)      │
└───────────────────────────────┴──────────────────┴─────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Configurable Workspace Density**: Allowing power users to switch to "Compact Mode" increases visible table rows from 12 to 18 on a standard 1080p display, drastically accelerating daily data verification.
- **Fixed Sidebar Width (280px/64px Collapsed)**: Sidebar width remains constant across wide displays to provide predictable grid layout coordinates for workspace containers.

---

## 5. Examples & Implementation Contracts

```jsx
// Spacing Grid & Density Aware Container Pattern
import { useUserPreferences } from '@/store/user-preferences';

export function DensityAwareCard({ title, children, actions }) {
  const { density } = useUserPreferences(); // 'comfortable' | 'compact'
  
  const paddingClass = density === 'compact' ? 'p-4 gap-3' : 'p-6 gap-6';

  return (
    <div className={`bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl flex flex-col ${paddingClass}`}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Always Use Proportional Grid Multiples**: Margin and padding values must be divisible by 4 (e.g., 4, 8, 12, 16, 24, 32, 48).
- **Prevent Fluid Width Distortion**: Limit maximum content container widths (`max-w-7xl` or `1400px`) on ultra-wide monitors to preserve line-length readability.

---

## 7. Future Considerations

- **Auto-Density Responsive Adaptation**: Automatically scaling down UI density when running on lower resolution displays (< 900px height).
