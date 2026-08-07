# 28 — Mobile Responsive Design & Touch Target Specifications

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Mobile UX Designers, Responsive Frontend Engineers, QA Engineers
- **Cross-References**: `07_Spacing_Grid_System.md`, `10_Layout_System.md`, `29_Accessibility.md`

---

## 1. Purpose

This document details the responsive design strategy for Awais HR across mobile (`< 640px`), tablet (`640px - 1024px`), desktop (`1024px - 1536px`), and ultra-wide displays (`> 1536px`). It specifies touch target minimums, mobile bottom sheet drawers, and collapsible navigation breakpoints.

---

## 2. Executive Overview

While HR administrators primarily work on desktop monitors, managers and employees frequently access clock-ins, leave requests, payslips, and approvals via mobile smartphones and tablets. Awais HR ensures 100% feature parity across viewports through mobile bottom drawers, touch-friendly `44px` targets, and responsive table card transformations.

---

## 3. Detailed Specifications

### 3.1 Viewport Breakpoint & Component Transformation Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ RESPONSIVE COMPONENT ADAPTATION MATRIX                                 │
├─────────────────┬──────────────────────────┬───────────────────────────┤
│ VIEWPORT SCALE  │ NAVIGATION SHELL ADAPTATION│ DATA TABLE TRANSFORMATION │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ Mobile (<640px) │ Top Hamburger Drawer     │ Horizontal Scroll or Cards│
│ Tablet (640-1024)│ Collapsed Icon Rail (64px)│ Compact Column Table      │
│ Desktop (1024+) │ Expanded Sidebar (280px) │ Full Column TanStack Table│
└─────────────────┴──────────────────────────┴───────────────────────────┘
```

### 3.2 Mobile Touch Target & Spacing Rules
- **Minimum Interactive Touch Target**: `44px` x `44px` (Apple Human Interface & Android Material Standard).
- **Bottom Sheet Drawer**: Slide-up sheet replacing right-side desktop inspector drawer on viewports `< 640px`.

---

## 4. Design Decisions & Rationale

- **Bottom Sheet Drawers on Mobile**: Mobile users operate devices primarily with their thumbs. Modal dialogs and action sheets anchor to the bottom of the screen (`bottom-0 rounded-t-2xl`) for comfortable one-handed operation.

---

## 5. Examples & Implementation Contracts

```jsx
// Responsive Drawer Component Contract (Sheet vs Modal)
import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function ResponsiveInspectorSheet({ isOpen, onClose, title, children }) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className={`bg-[var(--bg-surface-l1)] border-[var(--border-strong)] flex flex-col ${
        isMobile
          ? 'w-full h-[85vh] rounded-t-2xl border-t mt-auto animate-in slide-in-from-bottom'
          : 'w-[480px] h-full border-l animate-in slide-in-from-right'
      }`}>
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-subtle)]">
          <h3 className="font-bold text-sm text-[var(--text-primary)]">{title}</h3>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Never Force Horizontal Page Scrolling**: Only data tables may scroll horizontally; main page layouts must maintain `overflow-x: hidden`.
- **Disable Auto-Zoom on Input Focus**: Set `font-size: 16px` (1rem) on mobile form inputs to prevent iOS Safari auto-zoom behavior.

---

## 7. Future Considerations

- **PWA (Progressive Web App) Manifest**: Full offline capability with home screen installation for mobile attendance clock-ins.
