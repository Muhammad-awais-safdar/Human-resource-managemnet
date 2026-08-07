# 03 — App Shell Layout Architecture & Multi-Pane Systems

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Layout Engineers, Frontend Architects, UI Component Authors
- **Design System Cross-Reference**: `docs/ui-ux/10_Layout_System.md`, `docs/ui-ux/28_Mobile_Responsive.md`

---

## 1. Purpose

This document details the frontend implementation of the master application layout shell for **Awais HR**. It specifies the persistent top utility header, left collapsible sidebar, central workspace viewport, and right slide-over inspector drawer.

---

## 2. Scope

This specification governs all layout wrappers, viewport scroll containers, responsive sidebar collapses, slide-over drawer portals, and z-index layering matrices across desktop and mobile screen viewports.

---

## 3. Standards & Layout Guidelines

### 3.1 Layout Anatomy Standard
The layout operates as a persistent 4-pane layout shell:
- **Top Utility Header (`Height: 56px`)**: Fixed top bar containing Tenant Switcher, Search Command trigger (`Cmd+K`), Notification Bell, and User Profile menu.
- **Left Navigation Sidebar (`Width: 280px / 64px Collapsed`)**: Fixed left panel with accordion module items.
- **Main Workspace Viewport (`Flex-1, overflow-y-auto`)**: Independent scrolling canvas containing page headers, stat cards, and data grids.
- **Right Inspector Drawer (`Width: 480px / 100vw Mobile`)**: Fixed slide-over sheet for row details, forms, and logs.

---

## 4. Folder Structure & Layout Files

```
src/components/shell/
├── AppShellLayout.tsx             # Master Grid Layout Container
├── TopNavbar.tsx                  # 56px Fixed Header
├── PrimarySidebar.tsx             # Collapsible Accordion Navigation
├── SidebarItem.tsx                # Individual Navigation Link
├── InspectorDrawer.tsx            # 480px Slide-Over Portal
├── CommandPaletteModal.tsx        # Cmd+K Search Overlay
└── UserProfileMenu.tsx            # User Dropdown Menu
```

---

## 5. Naming Conventions

- **Layout Components**: PascalCase ending in `Layout` or `Drawer` (e.g., `AppShellLayout.tsx`, `InspectorDrawer.tsx`).
- **Slot Props**: Named `children`, `inspectorContent`, `headerActions`.

---

## 6. Implementation Code Contracts

```typescript
// App Shell Layout Architecture Contract (src/components/shell/AppShellLayout.tsx)
import React, { useState } from 'react';
import { TopNavbar } from './TopNavbar';
import { PrimarySidebar } from './PrimarySidebar';
import { InspectorDrawer } from './InspectorDrawer';
import { useUserPreferencesStore } from '@/store/useUserPreferencesStore';

export interface AppShellLayoutProps {
  children: React.ReactNode;
  inspectorContent?: React.ReactNode;
  onCloseInspector?: () => void;
}

export function AppShellLayout({ children, inspectorContent, onCloseInspector }: AppShellLayoutProps) {
  const { sidebarCollapsed } = useUserPreferencesStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden relative">
        <PrimarySidebar collapsed={sidebarCollapsed} />
        <main className="flex-1 flex flex-col overflow-y-auto p-6 relative scrollbar-thin">
          {children}
        </main>
        {inspectorContent && (
          <InspectorDrawer isOpen={!!inspectorContent} onClose={onCloseInspector}>
            {inspectorContent}
          </InspectorDrawer>
        )}
      </div>
    </div>
  );
}
```

---

## 7. Best Practices

- **Independent Scroll Containment**: Keep `overflow-y-auto` isolated to the `<main>` viewport to prevent scrolling the navbar or sidebar when scrolling data tables.
- **Use Portals for Overlays**: Render modals and drawers into document body portals to prevent parent CSS overflow clipping.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** persist sidebar collapse state in Zustand linked to `localStorage`.
- **DO** lock body scrolling (`overflow: hidden`) when an overlay drawer opens on mobile viewports.

### Don'ts
- **DON'T** hardcode fixed heights in viewport containers; use flexbox dynamic height calculations (`h-screen` / `flex-1`).
- **DON'T** allow the main content canvas to force horizontal scrollbars on desktop viewports.

---

## 9. Dependencies Reference

- `@radix-ui/react-dialog`: Portal & Dialog primitive overlay hooks
- `zustand`: User preference store for layout sidebar state

---

## 10. Implementation Notes

The layout components strictly adhere to the z-index hierarchy:
- Base Canvas: `z-0`
- Sticky Header / Table Headers: `z-10`
- Top Navbar: `z-20`
- Left Sidebar: `z-30`
- Inspector Drawer: `z-50`
- Toast Notifications: `z-60`
