# 37 — Next.js 16 Frontend Architecture & State Management

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Frontend Architects, Lead React Engineers, State Management Authors
- **Cross-References**: `10_Layout_System.md`, `38_Component_Development_Guide.md`, `39_UI_Coding_Standards.md`

---

## 1. Purpose

This document details the frontend engineering architecture for Awais HR. Built with **Next.js 16 (App Router)**, **React 19**, **Zustand**, and **TanStack Query v5**, it specifies project directory structures, data fetching strategies, client vs. server component boundaries, and state management rules.

---

## 2. Executive Overview

Awais HR demands enterprise performance: sub-100ms page transitions, zero Cumulative Layout Shift (CLS), instant optimistic state updates, and robust offline caching. The frontend leverages Next.js App Router server components for static layout rendering while isolating interactive state into client components managed by Zustand and TanStack Query.

---

## 3. Detailed Specifications

### 3.1 Project Directory Architecture Taxonomy (`frontend/src`)

```
src/
├── app/                            # Next.js 16 App Router Pages
│   ├── (auth)/                     # Auth Route Group
│   ├── (dashboard)/                # Main Dashboard Route Group
│   ├── globals.css                 # Global CSS & Tailwind v4
│   └── layout.js                   # Root HTML Shell
├── components/                     # Component Library Catalog
│   ├── ui/                         # Primitive Components (Button, Input, Dialog)
│   ├── shell/                      # App Shell (Navbar, Sidebar, CommandPalette)
│   └── shared/                     # Reusable Composite Components
├── modules/                        # Domain Module Encapsulation
│   ├── employee/                   # Employee Directory Views & Hooks
│   ├── payroll/                    # Payroll Wizard Components
│   └── attendance/                 # Timekeeping Widgets
├── hooks/                          # Custom React Hooks
├── services/                       # API Services & Axios Interceptors
├── store/                          # Zustand Global State Stores
└── styles/                         # CSS Variables & Layout Modules
```

### 3.2 State Management Taxonomy Matrix

| State Type | Management Engine | Target Use Case | Persistence |
| :--- | :--- | :--- | :--- |
| **Server State** | TanStack Query v5 | API data caching, pagination, revalidation | Cache memory / Stale-while-revalidate |
| **Global Client State**| Zustand | Sidebar collapse, user preferences, active tenant | `localStorage` sync |
| **UI Form State** | React Hook Form + Zod | Input validation, wizard step state | `IndexedDB` draft sync |
| **Transient UI State** | React `useState` | Modal open/close, hover tooltips | Component unmount cleanup |

---

## 4. Design Decisions & Rationale

- **Zustand over Redux Toolkit**: Zustand provides a lightweight (< 1kb), boilerplate-free store store pattern that operates outside the React render tree, preventing unnecessary component re-renders.
- **TanStack Query Stale-While-Revalidate Engine**: Ensures data tables display cached data instantly upon route navigation while quietly revalidating against PostgreSQL in the background.

---

## 5. Examples & Implementation Contracts

```javascript
// Zustand Global Tenant Preference Store Contract
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserPreferencesStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      density: 'comfortable', // 'comfortable' | 'compact'
      sidebarCollapsed: false,

      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'awais-user-preferences' }
  )
);
```

---

## 6. Best Practices

- **Isolate Client Components**: Keep `'use client'` directives as low in the component tree as possible to maximize Next.js Server Component rendering efficiency.
- **Centralize API Interceptors**: Attach auth JWT tokens and tenant headers (`X-Tenant-ID`) inside a single Axios interceptor (`services/api.js`).

---

## 7. Future Considerations

- **Server Actions Integration**: Migrating complex mutation triggers to native Next.js Server Actions for enhanced security and simplified server-client data mutations.
