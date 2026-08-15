# Enterprise RBAC Target Architecture & Security Specification

## 1. Overview
This document specifies the target architecture for the feature-gated, multi-tenant Role-Based Access Control (RBAC) system in the Awais HR SaaS platform.

---

## 2. Layered Authorization Evaluation Pipeline

Every incoming API request passes through a multi-layer evaluation pipeline:

```text
                  +-----------------------------------+
                  |        Authenticated User         |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |      Tenant Context Resolved      |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |      Feature Module Enabled?      |  ---> NO ---> [ 403 FEATURE_DISABLED ]
                  +-----------------------------------+
                                    | YES
                                    v
                  +-----------------------------------+
                  |       Active Role Assigned?       |  ---> NO ---> [ 403 ROLE_INACTIVE ]
                  +-----------------------------------+
                                    | YES
                                    v
                  +-----------------------------------+
                  |   Required Permission Granted?    |  ---> NO ---> [ 403 PERMISSION_DENIED ]
                  +-----------------------------------+
                                    | YES
                                    v
                  +-----------------------------------+
                  |       Resource Scope Valid?       |  ---> NO ---> [ 403 SCOPE_DENIED ]
                  +-----------------------------------+
                                    | YES
                                    v
                          [ 200 ALLOW EXECUTION ]
```

---

## 3. Data Model & Schema Specification

### 3.1 `role` Table Enhancements
```sql
ALTER TABLE role ADD COLUMN IF NOT EXISTS is_system_role BOOLEAN DEFAULT FALSE;
ALTER TABLE role ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE role ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE role ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### 3.2 `permission` Table Enhancements
```sql
ALTER TABLE permission ADD COLUMN IF NOT EXISTS module_key VARCHAR(50) DEFAULT 'CORE_HR';
ALTER TABLE permission ADD COLUMN IF NOT EXISTS feature_key VARCHAR(50) DEFAULT 'EMPLOYEES';
ALTER TABLE permission ADD COLUMN IF NOT EXISTS action_key VARCHAR(50) DEFAULT 'READ';
ALTER TABLE permission ADD COLUMN IF NOT EXISTS ui_label VARCHAR(100);
ALTER TABLE permission ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT FALSE;
```

### 3.3 `role_permission` Table Enhancements
```sql
ALTER TABLE role_permission ADD COLUMN IF NOT EXISTS access_scope VARCHAR(20) DEFAULT 'COMPANY';
```

---

## 4. Human-Friendly UI Mapping Architecture

Internal permission keys map directly to business-friendly UI labels:

| Internal Permission Key | Module | Feature | UI Business Label | Sensitive Action? |
| :--- | :--- | :--- | :--- | :--- |
| `corehr:employee:read` | Core HR | Employee Management | View Employee Directory & Profiles | No |
| `corehr:employee:write` | Core HR | Employee Management | Create & Edit Employee Details | No |
| `payroll:salary:approve` | Payroll | Salary Disbursements | Approve Monthly Payroll Runs | ⚠️ Sensitive |
| `payroll:salary:process` | Payroll | Salary Disbursements | Execute Direct Bank Disbursements | ⚠️ Sensitive |
| `recruitment:ats:manage` | Recruitment | ATS Pipeline | Manage Job Posts & Candidate Pipeline | No |

---

## 5. Security & Isolation Rules

1. **System Role Protection**: Roles marked with `is_system_role = true` (`SUPER_ADMIN`, `TENANT_ADMIN`, `EMPLOYEE`) cannot be deleted or renamed.
2. **Super Admin Guard**: A tenant must always maintain at least 1 active user with `TENANT_ADMIN` role. Attempting to demote or delete the final `TENANT_ADMIN` throws an administrative error.
3. **Tenant Boundary Enforcement**: `PermissionAspect` validates permission mappings strictly against the active tenant connection string and tenant context.
