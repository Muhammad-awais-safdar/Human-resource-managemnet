# 20 — Responsive Viewport Strategy: Mobile Breakpoints & Bottom Sheets

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Mobile Web Engineers, Layout Architects, UI Engineers
- **Design System Cross-Reference**: `docs/ui-ux/28_Mobile_Responsive.md`

---

## 1. Purpose

This document specifies the responsive viewport strategies for **Awais HR**. It covers Tailwind CSS v4 breakpoint definitions (`sm`, `md`, `lg`, `xl`, `2xl`), mobile bottom sheet drawers, touch-friendly hit targets (min 44px), and adaptive navigation menus.

---

## 2. Scope

This specification governs responsive behavior across mobile smartphones (375px), tablets (768px), laptops (1024px), and desktop displays (1440px+).

---

## 3. Standards & Breakpoint Architecture

### 3.1 Responsive Breakpoint Scale Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ RESPONSIVE BREAKPOINT SCALE MATRIX                                     │
├─────────────────┬────────────────┬─────────────────────────────────────┤
│ BREAKPOINT PREFIX│ MIN WIDTH (PX) │ ADAPTIVE LAYOUT BEHAVIOR            │
├─────────────────┼────────────────┼─────────────────────────────────────┤
│ Mobile (`base`) │ 375px          │ Single column, bottom sheets, drawer│
│ `sm`            │ 640px          │ 2-column card grid, compact tables  │
│ `md`            │ 768px          │ Sidebar turns into slide-over sheet │
│ `lg`            │ 1024px         │ 280px Persistent Left Sidebar active│
│ `xl`            │ 1280px         │ Full 4-pane layout shell with drawer│
│ `2xl`           │ 1536px         │ High-density analytics viewports    │
└─────────────────┴────────────────┴─────────────────────────────────────┘
```

---

## 4. Folder Structure & Responsive Directory

```
src/components/
├── overlay/
│   └── MobileBottomSheet.tsx       # Touch Bottom Sheet Drawer
├── shell/
│   └── MobileNavigationMenu.tsx    # Mobile Hamburger Bottom Bar
└── hooks/
    └── useMediaQuery.ts            # Viewport breakpoint listener hook
```

---

## 5. Naming Conventions

- **Responsive Components**: `MobileBottomSheet.tsx`, `MobileNavigationMenu.tsx`.
- **Media Query Hook**: `useMediaQuery.ts`.

---

## 6. Implementation Code Contracts

```typescript
// Custom Viewport Breakpoint Hook Contract (src/hooks/useMediaQuery.ts)
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
```

---

## 7. Best Practices

- **Enforce Minimum Touch Target Sizes**: Ensure interactive buttons, table checkboxes, and icon triggers have at least `44px x 44px` touch target areas on mobile devices.
- **Convert Inspector Drawers to Bottom Sheets**: Transform 480px right inspector sheets into full-width bottom sheets (`100vw`, rounded top corners) on screens `< 768px`.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** hide secondary table columns on mobile viewports using Tailwind breakpoint classes (`hidden md:table-cell`).
- **DO** use `svh` (Small Viewport Height) for full-height mobile containers to account for mobile browser URL bars.

### Don'ts
- **DON'T** rely exclusively on CSS display hidden for heavy mobile elements; unmount unneeded desktop components via JS viewport guards.
- **DON'T** allow table data containers to cause horizontal overflow page bouncing on smartphones.

---

## 9. Dependencies Reference

- Tailwind CSS v4 `@theme` breakpoint directives
- `@radix-ui/react-dialog`: Accessible mobile modal overlay primitive

---

## 10. Implementation Notes

Swiping down on mobile bottom sheets (`MobileBottomSheet.tsx`) triggers a Framer Motion drag gesture that smoothly closes the overlay.
