# 10 — Application Shell & Multi-Pane Layout System

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Layout Engineers, Frontend Architects, UI Designers
- **Cross-References**: `07_Spacing_Grid_System.md`, `11_Navigation_System.md`, `28_Mobile_Responsive.md`

---

## 1. Purpose

This document specifies the master layout shell architecture for Awais HR. It governs the top utility navbar, left primary sidebar, sub-navigation panels, main workspace viewport, right inspector drawer, and responsive layout behavior.

---

## 2. Executive Overview

Awais HR avoids full-page browser reloads. The application operates inside a persistent multi-pane shell structure where header, navigation, and sidebar states remain mounted across client-side route transitions. The layout dynamically adapts to screen viewports and exposes a right-side inspector drawer for uninterrupted workflow execution.

---

## 3. Detailed Specifications

### 3.1 Master Layout Shell Spatial Anatomy

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ MASTER APPLICATION SHELL ARCHITECTURE                                                   │
├─────────────────┬───────────────────────────────────────────────────────┬───────────────┤
│ TOP NAVBAR      │ Logo Mark | Tenant Switcher | Search (Cmd+K) | Alert  │ User Profile  │
│ (Height: 56px)  │                                                       │               │
├─────────────────┼───────────────────────────────────────────────────────┼───────────────┤
│ PRIMARY SIDEBAR │ MAIN WORKSPACE CANVAS                                 │ INSPECTOR     │
│ (Width: 280px / │ - Sticky Module Page Header                           │ DRAWER        │
│  64px Collapsed)│ - Executive Metric Cards                              │ (Width: 480px)│
│                 │ - Data Workspace (Tables / Charts / Grids)            │               │
│ - Accordion Nav │                                                       │ - Context Data│
│ - Quick Links   │                                                       │ - Quick Edit  │
│ - User Badge    │                                                       │ - Activity Log│
├─────────────────┴───────────────────────────────────────────────────────┴───────────────┤
│ FOOTER BAR (Optional): System Status Indicator | WS Connection Status | App Version     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Layout Z-Index Hierarchy Layering Matrix

| Layer Name | Z-Index Value | Target Layout Components |
| :--- | :--- | :--- |
| `base` | `z-0` | Canvas background, card containers |
| `sticky-header` | `z-10` | Page title sticky header, table header rows |
| `navbar` | `z-20` | Top utility navbar, persistent application header |
| `sidebar` | `z-30` | Left primary navigation sidebar |
| `popover` | `z-40` | Context menus, dropdown triggers, date pickers |
| `drawer` | `z-50` | Right slide-over inspector drawer |
| `modal` | `z-50` | Centered confirmation dialog modals |
| `toast` | `z-60` | Notification toast alerts (`top-right`) |

---

## 4. Design Decisions & Rationale

- **Independent Scroll Containers**: The main workspace canvas (`overflow-y-auto`) and left sidebar (`overflow-y-auto`) feature independent scrollbars. Scrolling through a long employee table never scrolls the navigation menu or top header.
- **Collapsible Sidebar Memory**: The collapse state of the left sidebar (`280px` expanded vs. `640px` compact icon rail) is persisted in user preferences (`localStorage`), maximizing screen real estate for wide data tables on smaller laptops.

---

## 5. Examples & Implementation Contracts

```jsx
// Master Shell Component Architecture (App Layout)
import React, { useState } from 'react';
import { TopNavbar } from './TopNavbar';
import { PrimarySidebar } from './PrimarySidebar';
import { InspectorDrawer } from './InspectorDrawer';

export function ApplicationLayoutShell({ children, inspectorContent, onCloseInspector }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* 1. Persistent Top Utility Header */}
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. Left Navigation Sidebar */}
        <PrimarySidebar collapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        {/* 3. Central Main Workspace Viewport */}
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-6 relative">
          {children}
        </main>

        {/* 4. Right Slide-Over Inspector Drawer */}
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

## 6. Best Practices

- **Never Hardcode Screen Heights**: Always use `h-screen` or `h-[100dvh]` to account for mobile browser URL bar height shifts.
- **Lock Parent Scroll on Modal Open**: When a modal or drawer opens, enforce `overflow: hidden` on the parent workspace container.

---

## 7. Future Considerations

- **Multi-Monitor Split Workspace Support**: Allowing power HR users to pop out tables or candidate review scorecards into secondary browser windows.
