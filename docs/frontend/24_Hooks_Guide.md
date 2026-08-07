# 24 — Custom React Hooks Directory & Custom Utility Hooks Architecture

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Frontend Engineers, React Developers, Custom Hook Authors
- **Design System Cross-Reference**: `docs/ui-ux/37_Frontend_Architecture.md`

---

## 1. Purpose

This document catalogs the custom React hooks suite for **Awais HR**. It specifies implementation rules, memory optimization patterns, event listener cleanups, and state encapsulation guidelines.

---

## 2. Scope

This specification governs all custom hooks stored within `src/hooks/` and domain module hook directories (`src/modules/*/hooks/`).

---

## 3. Standards & Custom Hooks Catalog

### 3.1 Global Custom Hooks Catalog
- `useTenantContext`: Resolves active tenant ID, white-label branding, and database routing slug.
- `useHotkeys`: Binds global keyboard shortcuts (`Cmd+K`, `Esc`, `/`) safely.
- `useDebounce`: Delays high-frequency text inputs (300ms) before API execution.
- `useMediaQuery`: Listens to CSS viewport breakpoint media query updates.
- `useFileUpload`: Manages presigned URL generation and direct S3 binary file uploads.
- `useHasPermission`: Evaluates user RBAC permission token entitlements.
- `useClickOutside`: Detects clicks outside an element to close dropdown menus or drawers.

---

## 4. Folder Structure & Hooks Directory

```
src/hooks/
├── useTenantContext.ts            # Active Tenant & Routing Hook
├── useHotkeys.ts                  # Keyboard Listener Hook
├── useDebounce.ts                 # Input Debounce Hook
├── useMediaQuery.ts               # Viewport Breakpoint Hook
├── useFileUpload.ts               # File Upload State Hook
├── useHasPermission.ts            # RBAC Entitlement Check Hook
└── useClickOutside.ts             # Outside Click Listener Hook
```

---

## 5. Naming Conventions

- **Hook Files & Functions**: Lowercase camelCase starting with `use` (e.g. `useTenantContext.ts`).

---

## 6. Implementation Code Contracts

```typescript
// Custom Click Outside Listener Hook Contract (src/hooks/useClickOutside.ts)
import { useEffect, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
```

---

## 7. Best Practices

- **Always Clean Up Side Effects**: Ensure `useEffect` listeners remove global event listeners on unmount.
- **Memoize Callback Handlers**: Wrap custom hook returned helper functions in `useCallback` to prevent unnecessary caller re-renders.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** prefix all custom hook names with `use`.
- **DO** write unit tests for custom hooks using `renderHook` from React Testing Library.

### Don'ts
- **DON'T** call React hooks conditionally inside loops or if statements.
- **DON'T** store duplicate server state inside custom hooks; rely on TanStack Query.

---

## 9. Dependencies Reference

- `@testing-library/react-hooks`: Hook testing utility

---

## 10. Implementation Notes

Custom hooks must strictly return typed objects or tuple arrays with clean TypeScript interfaces.
