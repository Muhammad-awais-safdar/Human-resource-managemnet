# Awais HR — Frontend Authorization & Permission Guards Architecture

## 1. Overview

Phase 17 hardens **Frontend Authorization** by synchronizing React client-side permission checks with backend JWT authorities, RBAC scopes, and superuser bypass controls.

---

## 2. Permission Hook (`usePermissions.js`)

The `usePermissions` custom hook decodes JWT tokens from client storage without third-party dependencies, exposing explicit evaluation helpers:

- `hasRole(roleName)`: Validates role presence.
- `isSuperUser()`: Evaluates superuser roles (`SUPER_ADMIN`, `SYSTEM_ADMIN`, `TENANT_ADMIN`, `ADMIN`).
- `hasPermission(permissionName)`: Validates explicit permissions with domain wildcard support (e.g., `payroll:*`).
- `hasAnyPermission(permissionsArray)`: Evaluates OR condition for UI permission lists.
- `hasAllPermissions(permissionsArray)`: Evaluates AND condition for complex UI features.

---

## 3. Declarative Component Guard (`<PermissionGuard>`)

React components can be conditionally rendered using `<PermissionGuard>`:

```jsx
import PermissionGuard from '@/components/auth/PermissionGuard';

<PermissionGuard permission="leave:approve" fallback={<p>Access Denied</p>}>
  <ApproveLeaveButton />
</PermissionGuard>
```

---

## 4. Protected Routes Integration

Routes are guarded at the component or dashboard level. Unauthorized users attempting direct URL access are redirected to `/403-forbidden` or shown custom fallbacks.
