# 19 — Caching Strategy: TanStack Query Invalidation & Stale-While-Revalidate

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Performance Architects, Frontend Engineers, Query Leads
- **Design System Cross-Reference**: `docs/ui-ux/37_Frontend_Architecture.md`

---

## 1. Purpose

This document details the client-side caching, cache invalidation, garbage collection, and Stale-While-Revalidate (SWR) policies for **Awais HR** using **TanStack Query v5**.

---

## 2. Scope

This specification applies to all asynchronous server data queries across employee records, payroll runs, attendance logs, settings, and subscription entitlements.

---

## 3. Standards & Caching Rules

### 3.1 Cache Stale Time Hierarchy
- **Volatile Real-Time Data (Attendance Clock-Ins, WebSocket Logs)**: `staleTime: 0` (Revalidate immediately on window focus).
- **Standard Operational Data (Employee Directory, Leaves, ATS Kanban)**: `staleTime: 1000 * 60 * 2` (2 minutes).
- **Static Metadata (Departments, Tax Rules, Roles, Subscription Plans)**: `staleTime: 1000 * 60 * 60` (1 hour).

---

## 4. Folder Structure & Query Key Directory

```
src/
├── services/
│   └── queryKeys.ts                # Central Query Key Factory
└── hooks/
    ├── useEmployeeQueries.ts       # Employee Query Hooks
    └── usePayrollQueries.ts        # Payroll Query Hooks
```

---

## 5. Naming Conventions

- **Query Key Factory**: Centralized object `queryKeys` returning nested tuple arrays (e.g. `queryKeys.employees.list(filters)`).

---

## 6. Implementation Code Contracts

```typescript
// Centralized Query Key Factory Contract (src/services/queryKeys.ts)
export const queryKeys = {
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.employees.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.employees.all, 'detail', id] as const,
  },
  payroll: {
    all: ['payroll'] as const,
    runs: () => [...queryKeys.payroll.all, 'runs'] as const,
    runDetail: (id: string) => [...queryKeys.payroll.all, 'run', id] as const,
  },
};

// Custom Query Hook with Cache Strategy (src/hooks/useEmployeeQueries.ts)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { queryKeys } from '@/services/queryKeys';

export function useEmployeeList(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: () => employeeService.getEmployees(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes garbage collection
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeService.updateEmployee,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries cleanly
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}
```

---

## 7. Best Practices

- **Centralize Query Keys**: Always use `queryKeys` factory tuples to prevent cache invalidation key typos.
- **Set Explicit `gcTime`**: Garbage collect unused query cache data after 10 minutes to manage memory footprint.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** leverage optimistic query cache updates for fast toggle triggers.
- **DO** refetch queries automatically on browser window re-focus for real-time compliance views (`refetchOnWindowFocus: true`).

### Don'ts
- **DON'T** use raw string keys like `['employees', id]` directly inside components.
- **DON'T** clear the entire query cache when invalidating a single entity record.

---

## 9. Dependencies Reference

- `@tanstack/react-query`: `^5.28.0`

---

## 10. Implementation Notes

Switching active enterprise tenants automatically purges all active query caches (`queryClient.clear()`) to prevent tenant data leakage across sessions.
