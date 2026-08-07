# 13 — Debounced Search, URL Query Filtering & Dynamic Filter Bars

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Frontend Engineers, Search Specialists, Data Table Developers
- **Design System Cross-Reference**: `docs/ui-ux/11_Navigation_System.md`, `docs/ui-ux/14_Table_Standards.md`

---

## 1. Purpose

This document details the search and filtering architecture for **Awais HR**. It covers debounced text search, URL search parameter synchronization, dynamic multi-select filter dropdowns, and filter chip management.

---

## 2. Scope

This specification applies to search inputs and filter action bars across all data tables (Employee Directory, Attendance, Payroll, ATS, Assets, Help Desk, Audit Logs).

---

## 3. Standards & Search Architecture

### 3.1 Search & Filter State Flow
```
┌────────────────────────────────────────────────────────────────────────┐
│ SEARCH & FILTER URL SYNCHRONIZATION FLOW                               │
├────────────────────────────────────────────────────────────────────────┤
│ 1. User types in search input ("Sarah")                                │
│ 2. `useDebounce` delays URL sync by 300ms                              │
│ 3. `router.push('/employees?search=Sarah', { scroll: false })` updates URL│
│ 4. TanStack Query detects search query param update & fetches API      │
│ 5. Table updates with filtered data without full page reload           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & Search Directory

```
src/components/
├── primitives/
│   ├── SearchInput.tsx             # Debounced Search Input Component
│   ├── FilterDropdown.tsx          # Multi-Select Dropdown Filter
│   └── ActiveFilterChips.tsx       # Active Filter Removable Tags
└── hooks/
    ├── useDebounce.ts              # Custom 300ms debounce hook
    └── useSearchFilters.ts         # URL Search Params sync hook
```

---

## 5. Naming Conventions

- **Search Hooks**: `useDebounce.ts`, `useSearchFilters.ts`.
- **Search Components**: `SearchInput.tsx`, `TableFilterBar.tsx`.

---

## 6. Implementation Code Contracts

```typescript
// Custom Debounce Hook Contract (src/hooks/useDebounce.ts)
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 7. Best Practices

- **Enforce 300ms Search Debounce**: Delay search query execution by 300ms to prevent spamming backend APIs with every keystroke.
- **Sync Filter State with URL**: Always update URL search parameters (`?dept=eng&status=active`) so filtered table views are shareable.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** provide a clear `[✕]` trigger inside search inputs to instantly reset search queries.
- **DO** display active filter chips above table columns showing applied filter parameters.

### Don'ts
- **DON'T** trigger API search calls directly on raw `onChange` events without debouncing.
- **DON'T** wipe pagination state when changing search filters; reset page number to 1 on filter changes.

---

## 9. Dependencies Reference

- `next/navigation`: `useSearchParams`, `usePathname`, `useRouter`

---

## 10. Implementation Notes

The search bar renders a search icon (`Search`) on the left and a quick keyboard shortcut badge (`/`) on the right when un-focused.
