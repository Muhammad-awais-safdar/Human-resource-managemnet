# Awais HR — Admin RBAC & Audit Log UI Dashboard Architecture

## 1. Overview

Phase 18 implements the **Admin RBAC & Audit Log Dashboard UI**, enabling tenant administrators to manage custom roles, inspect user effective permissions, monitor Maker-Checker queues, and review tamper-evident audit ledgers under permission guards.

---

## 2. Core Dashboard Features & Route Guards

### A. Role Builder & Permission Matrix (`/roles`)
- Guarded by `<PermissionGuard permission="role:manage">`.
- Role builder supporting custom workspace role definitions.
- Hierarchical permission matrix displaying module feature action keys.
- Real-time Effective User Permission Inspector for troubleshooting RBAC grants.

### B. Compliance Audit Center (`/audit`)
- Guarded by `<PermissionGuard permission="audit:read">`.
- Displays real-time security mutation events logged by backend `@Auditable` aspects.
- Filtering by actor email, entity name, action type, and IP address.

### C. Unified Manager Approvals (`/approvals`)
- Guarded by `<PermissionGuard permission="approval:read">`.
- Central inbox for Leave, Expense, Travel, and Clearance approval queues.
- Approval delegation rules configuration.
