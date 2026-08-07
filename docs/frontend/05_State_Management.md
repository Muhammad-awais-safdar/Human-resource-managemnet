# 05 — State Management Strategy: Zustand & TanStack Query

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: React Engineers, Frontend Architects, State Management Maintainers
- **Design System Cross-Reference**: `docs/ui-ux/37_Frontend_Architecture.md`

---

## 1. Purpose

This document defines the dual-layer state management architecture for **Awais HR**. It separates asynchronous **Server State** (handled by **TanStack Query v5**) from synchronous **Client Global State** (handled by **Zustand**).

---

## 2. Scope

This specification governs all data fetching, caching, revalidation, global UI preferences, user session state, form draft storage, and offline synchronization across the frontend.

---

## 3. Standards & State Boundaries

### 3.1 Dual-Layer State Separation Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ STATE ARCHITECTURE SEPARATION MATRIX                                   │
├─────────────────┬──────────────────────────┬───────────────────────────┤
│ STATE DOMAIN    │ MANAGEMENT ENGINE        │ SCOPE & PERSISTENCE       │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ Server State    │ TanStack Query v5        │ API Data, Cache Memory,   │
│                 │ (useQuery, useMutation)  │ Stale-While-Revalidate    │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ Client UI State │ Zustand                  │ Sidebar Toggle, Theme,    │
│                 │ (usePreferencesStore)    │ Active Tenant, App Shell  │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ Form State      │ React Hook Form + Zod    │ Input Validation, Step    │
│                 │                          │ Drafts in IndexedDB       │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ Dynamic State   │ Next.js URL SearchParams │ Filters, Sorting, Page #  │
└─────────────────┴──────────────────────────┴───────────────────────────┘
```

---

## 4. Folder Structure & Store Directory

```
src/
├── store/                          # Zustand Client Stores
│   ├── useUserPreferencesStore.ts  # Theme, Density, Sidebar Collapse
│   ├── useAuthStore.ts             # Active User Session & JWT Claims
│   ├── useTenantStore.ts           # Selected Tenant & Branding Tokens
│   └── useCommandPaletteStore.ts   # Cmd+K Modal Open/Close State
└── hooks/                          # Custom TanStack Query Hooks
    ├── useEmployeeQueries.ts       # Server fetch & mutation hooks
    ├── usePayrollQueries.ts        # Payroll async state hooks
    └── useAttendanceQueries.ts     # Attendance clock-in mutations
```

---

## 5. Naming Conventions

- **Zustand Store Files**: Starts with `use` and ends with `Store.ts` (e.g., `useTenantStore.ts`).
- **TanStack Query Hook Files**: Starts with `use` and ends with `Queries.ts` or `Mutations.ts` (e.g., `useEmployeeQueries.ts`).
- **Store Actions**: Imperative verbs (e.g., `setTheme`, `toggleSidebar`, `clearSession`).

---

## 6. Implementation Code Contracts

```typescript
// Zustand User Preferences Store Contract (src/store/useUserPreferencesStore.ts)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferencesState {
  theme: 'dark' | 'light';
  density: 'comfortable' | 'compact';
  sidebarCollapsed: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setDensity: (density: 'comfortable' | 'compact') => void;
  toggleSidebar: () => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
      density: 'comfortable',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'awais-user-preferences',
    }
  )
);
```

---

## 7. Best Practices

- **Never Put Server Data in Zustand Stores**: Use TanStack Query for remote API data caching. Reserve Zustand exclusively for client-side UI states.
- **Select Specific Store Selectors**: Access store slices via explicit selector functions (e.g. `useUserPreferencesStore((state) => state.theme)`) to avoid unnecessary component re-renders.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** leverage TanStack Query's optimistic updates (`onMutate`) for instantaneous UI updates during status toggles or approvals.
- **DO** sync persistent user preferences to `localStorage` using Zustand's `persist` middleware.

### Don'ts
- **DON'T** create monolithic global stores; divide Zustand state into distinct logic stores (`useAuthStore`, `useTenantStore`).
- **DON'T** trigger manual `window.location.reload()` when query invalidation (`queryClient.invalidateQueries()`) can refresh server data cleanly.

---

## 9. Dependencies Reference

- `zustand`: Lightweight global state store
- `@tanstack/react-query`: Server state asynchronous data fetching & caching engine

---

## 10. Implementation Notes

TanStack Query default options must specify `staleTime: 1000 * 60 * 5` (5 minutes) for non-volatile metadata, and `staleTime: 0` for real-time attendance logs to guarantee data freshness.
