# Dynamic Feature Flags, Module Control & Dual-Scope RBAC Architecture

This document provides a comprehensive technical overview of the **Dynamic Feature Flag & Module Control Engine** and the **Dual-Scope Dynamic RBAC Architecture** implemented in **Awais HR Engine**.

---

## 🎛️ Part 1: Dynamic Module Control & Feature Flag Engine

### 1. Overview
The platform allows the **Super Admin / Product Owner** to dynamically enable or disable any of the 65 business modules:
- **Globally Platform-wide**: Turn OFF a module for all tenants (e.g. during emergency maintenance or feature retirement).
- **Per-Tenant Custom Entitlements**: Enable/disable specific modules for an individual tenant organization regardless of global default settings (e.g. selling *Recruitment ATS* or *AI Resume Parsing* as premium add-ons).

---

### 2. Database Schema (Master DB Migration V4)

```sql
CREATE TABLE IF NOT EXISTS platform_module (
    module_key VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'CORE' NOT NULL,
    description TEXT,
    is_globally_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_module_override (
    tenant_id UUID REFERENCES tenant(id) ON DELETE CASCADE,
    module_key VARCHAR(50) REFERENCES platform_module(module_key) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (tenant_id, module_key)
);
```

---

### 3. Backend AOP Interception (`@RequiresModule`)

Any controller or method decorated with `@RequiresModule("MODULE_KEY")` is intercepted before execution:

```java
@RestController
@RequestMapping("/recruitment")
@RequiresModule("RECRUITMENT")
public class RecruitmentController { ... }
```

**Execution Flow**:
1. Request arrives at `RecruitmentController`.
2. `ModuleAccessAspect` intercepts method call via AspectJ.
3. Checks local high-speed thread-safe cache (`ConcurrentHashMap`).
4. If cached status is `false` (disabled globally or for current tenant), throws `ModuleDisabledException`.
5. `GlobalExceptionHandler` catches the exception and returns **HTTP 402 Payment Required** with payload:
   ```json
   {
     "success": false,
     "moduleDisabled": true,
     "message": "Module 'RECRUITMENT' is currently disabled by the platform administrator."
   }
   ```

---

### 4. Super Admin Control Dashboard (`/superadmin/modules`)

Located under **SaaS Platform Control** in the Super Admin sidebar menu, this interface features:
- **Global Module Kill Switches**: Toggle ON/OFF for platform-wide availability.
- **Category Filter Tabs**: `TALENT`, `FINANCE`, `WORKFORCE`, `OPERATIONS`, `INNOVATION`, `SYSTEM`.
- **Per-Tenant Custom Override Drawer**: Grant (`ALLOW`), Revoke (`BLOCK`), or `RESET` module access per tenant workspace.

---

## 🔐 Part 2: Dynamic Dual-Scope RBAC System

Awais HR enforces a strict **Dual-Scope Role-Based Access Control (RBAC)** model separating platform operator authorities from tenant workplace permissions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DUAL-SCOPE RBAC ARCHITECTURE                          │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. SUPER ADMIN PLATFORM SCOPE     │ 2. TENANT WORKSPACE SCOPE          │
│    (Master Database Schema)       │    (Tenant Database Schema)        │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Tables: platform_role,          │ • Tables: role, permission,        │
│   platform_permission,            │   role_permission, employee_role   │
│   platform_role_permission        │                                    │
│ • Roles: SUPER_ADMIN,             │ • Roles: TENANT_ADMIN,             │
│   SUPPORT_ENGINEER,               │   HR_MANAGER, LINE_MANAGER,        │
│   FINANCE_AUDITOR,                │   FINANCE_ADMIN, RECRUITER,        │
│   PRODUCT_OPERATOR                │   EMPLOYEE                         │
│ • Scoped To: Platform Owners &    │ • Scoped To: Enterprise Company    │
│   SRE Operations                  │   Employees & HR Staff             │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

### 1. Platform Master Scope (Master DB Migration V5)

Seeded permissions in `platform_permission`:
- `tenant:create`: Provision new enterprise tenant databases.
- `tenant:suspend`: Suspend or terminate tenant workspaces.
- `module:feature_flag:edit`: Toggle global and tenant feature flags.
- `observability:view`: Access SRE telemetry, Prometheus metrics, Loki logs, and Grafana dashboards.
- `audit:export`: Query and export global security audit trails.
- `billing:override`: Grant custom pricing discounts and period extensions.
- `platform:rbac:manage`: Create platform roles and manage operator access.
- `impersonate:tenant`: Initiate audited support impersonation sessions.

### 2. Tenant Workspace Scope (Tenant DB)

Seeded permissions in tenant `permission` table:
- `corehr:employee:read`, `corehr:employee:write`
- `payroll:run:execute`, `payroll:bank_export:generate`
- `leave:approve`, `expense:approve`, `shift:schedule:manage`
- `recruitment:job:create`, `recruitment:candidate:review`

---

### 3. Super Admin RBAC Dashboard (`/superadmin/rbac`)

Accessible under **SaaS Platform Control** -> **🔐 Super Admin RBAC & Security**:
- **Tab 1: Platform Roles & Permission Matrix**: Create new platform roles, inspect attached permissions, and toggle granular checkboxes in real-time.
- **Tab 2: Platform Permissions Catalog**: Define new fine-grained platform security keys.
- **Tab 3: Operator Role Assignments**: View platform operators (Super Admins, Support Engineers) and adjust assigned global roles.

---

## 🛠️ Verification & Build Status

- **Backend compilation**: `mvn compile` -> **`BUILD SUCCESS`** (329 source files).
- **Frontend build**: `npm run build` -> **`BUILD SUCCESS`** (72 static routes generated).
