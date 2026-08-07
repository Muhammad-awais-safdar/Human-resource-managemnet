# 08 — Role-Based Access Control (RBAC) UI Masking & Permission Hooks

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Security Engineers, Frontend Developers, Component Authors
- **Design System Cross-Reference**: `docs/ui-ux/03_Design_Principles.md`, `docs/ui-ux/12_Dashboard_UX.md`

---

## 1. Purpose

This document details the frontend implementation of Role-Based Access Control (RBAC) in **Awais HR**. It specifies role hierarchy resolution (`SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER`, `EMPLOYEE`), permission guards, UI element masking, and route-level protection.

---

## 2. Scope

This specification governs all permission checks, conditional UI rendering wrappers, role-based navigation filters, and unauthorized fallback screens across the application.

---

## 3. Standards & Role Taxonomy

### 3.1 Role & Permission Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ ROLE & PERMISSION MATRIX                                               │
├─────────────────┬──────────────────────────────────────────────────────┤
│ ROLE IDENTIFIER │ ACCESSIBLE MODULE SCOPE                              │
├─────────────────┼──────────────────────────────────────────────────────┤
│ SYSTEM_ADMIN    │ SaaS Tenant Provisioning, System Audits, Global MRR  │
│ TENANT_ADMIN    │ All Tenant Modules, Settings, Roles, Subscriptions   │
│ HR_MANAGER      │ Employee Directory, Attendance, Payroll, ATS, LMS    │
│ EMPLOYEE        │ ESS Portal, My Attendance, My Leaves, My Payslips    │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & RBAC Directory

```
src/
├── hooks/
│   └── useHasPermission.ts         # Hook evaluating user permissions
├── components/
│   └── shared/
│       ├── PermissionGuard.tsx     # Conditional rendering wrapper
│       └── RoleGuard.tsx           # Role verification wrapper
```

---

## 5. Naming Conventions

- **Guard Components**: PascalCase ending in `Guard.tsx` (e.g. `PermissionGuard.tsx`).
- **Permission Hooks**: camelCase starting with `useHas` (e.g. `useHasPermission.ts`).
- **Permissions**: `DOMAIN:ACTION` uppercase strings (e.g. `PAYROLL:EXECUTE`, `EMPLOYEE:DELETE`).

---

## 6. Implementation Code Contracts

```typescript
// Permission Guard Component Contract (src/components/shared/PermissionGuard.tsx)
import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export interface PermissionGuardProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const userPermissions = useAuthStore((state) => state.user?.permissions || []);

  const required = Array.isArray(permission) ? permission : [permission];
  const hasPermission = required.every((p) => userPermissions.includes(p));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

## 7. Best Practices

- **Never Hide Security Enforcement on Client Side Only**: UI element masking is purely for user experience. Always enforce backend authorization checks on every REST API endpoint.
- **Provide Informative Tooltips on Disabled Buttons**: When an action button is disabled due to missing permissions, explain *why* in a hover tooltip (e.g., *"Requires Payroll Admin Permission"*).

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** use `PermissionGuard` to wrap sensitive action triggers like `[ Execute Payroll ]` or `[ Terminate Employee ]`.
- **DO** filter sidebar navigation links based on user role entitlements.

### Don'ts
- **DON'T** hardcode role strings inside components; check permission tokens (`EMPLOYEE:WRITE`) for flexibility.
- **DON'T** render empty container blocks when permission checks fail; hide the container or pass a clean fallback.

---

## 9. Dependencies Reference

- `zustand`: Auth store containing logged-in user profile & permissions array

---

## 10. Implementation Notes

The `useHasPermission('PAYROLL:READ')` hook memoizes evaluation using `useCallback` to prevent re-calculating permission arrays during high-frequency table re-renders.
