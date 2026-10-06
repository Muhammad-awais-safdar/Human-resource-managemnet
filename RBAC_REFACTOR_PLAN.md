# Awais HR — RBAC Refactor Plan
## Phase 0: Repository & Architecture Audit Results

> **Status**: Audit Complete. No code changed yet.  
> **Last Audited**: 2026-10-06

---

## 1. Current Architecture Overview

### 1.1 Tenant Isolation Model

**Finding: Database-per-Tenant is the ACTUAL implementation.**

The README references "PostgreSQL Schema-per-Tenant" but the code proves otherwise:

| Evidence Source | Finding |
|---|---|
| `DatabaseConfig.java` | Uses MySQL (`jdbc:mysql://localhost:3306/awais_hr_master`). Not PostgreSQL. |
| `TenantRoutingDataSource` | Dynamically routes to separate per-tenant database connections |
| `TenantService.registerNewTenant()` | Creates a new physical database per tenant |
| `tenant.db_url` column in master schema | Each tenant row stores its own distinct JDBC URL |
| Flyway locations | `db/migration/master` and `db/migration/tenant/core` — two separate Flyway trees |

**Conclusion:** The platform uses **Database-per-Tenant on MySQL**. The "PostgreSQL Schema-per-Tenant" mentioned in the README and MODULE_ROLES_HIERARCHY.md is incorrect. Do not migrate this — preserve the existing Database-per-Tenant model.

### 1.2 Tenant Resolution Mechanism

1. `TenantResolutionFilter` runs at `@Order(HIGHEST_PRECEDENCE)` — resolves from `X-Tenant` header or Host subdomain.
2. Resolved tenant ID stored in `TenantContextHolder` (ThreadLocal backed by `TenantContextHolder` in `module.tenant.infrastructure.context` — delegate pattern).
3. `TenantRoutingDataSource` reads current tenant from ThreadLocal and switches the JDBC connection dynamically.
4. ThreadLocal is cleared in `finally` block — no leak risk.

**Status**: ✅ Correctly implemented.

### 1.3 JWT & Authentication Flow

| Component | Finding |
|---|---|
| `JwtUtils.java` | Generates/validates tokens. Claims: `sub` (email), `tenantId`, `roles` (comma-separated string) |
| `JwtAuthenticationFilter` | Extracts email + tenantId + roles from JWT. Cross-tenant access blocked at filter level. |
| `SecurityConfig` | Stateless JWT, no session. Roles prefixed with `ROLE_` in Spring authorities. |
| Session binding | Active session table validates IP + UserAgent for hijack detection. |

**Security Gap Found:**
- JWT secret is **hardcoded** in `JwtUtils.java`: `"awais_hr_enterprise_secure_jwt_token_secret_key_256_bits_long"` — must be moved to environment variable / config server.
- Roles embedded in JWT token are **not re-validated against the database** on each request. If a role is revoked in the DB, the user retains it until JWT expiry (24 hours). This is a privilege escalation window.

### 1.4 Current RBAC Database Schema (Tenant DB)

```sql
-- V1 (baseline)
permission (id, name, description)
role (id, name, description)
role_permission (role_id, permission_id)   -- PK pair, no scope column initially
employee (id, employee_code, first_name, last_name, email, password, status, joining_date)
employee_role (employee_id, role_id)       -- PK pair — ONE active role assumed

-- V51 (additive enhancements)
role.is_system_role BOOLEAN
role.status VARCHAR(20)
role.created_at, role.updated_at
permission.module_key, permission.feature_key, action_key, ui_label, is_sensitive
role_permission.access_scope VARCHAR(20) DEFAULT 'COMPANY'  -- ← exists but not enforced in code
```

**Critical Gap**: `employee_role` has composite PK `(employee_id, role_id)`, allowing multiple roles per user at the schema level. **However the DataSeeder assigns exactly one role per employee** and `updateEmployeeRole()` in `EmployeeLifecycleServiceImpl` **deletes all existing roles and inserts one** — effectively treating it as single-role.

**Gap**: `role_permission.access_scope = 'COMPANY'` column exists in DB but is never read by `PermissionAspect.java`. Scope column is a dead column.

**Gap**: No `effective_from`, `effective_until`, `assigned_by` on `employee_role`.

---

## 2. Current Permission Model

### 2.1 Seeded Permissions (14 total in DataSeeder)

```
corehr:employee:read
corehr:employee:write
corehr:org:write
corehr:settings:write
payroll:salary:read
payroll:salary:write
payroll:salary:approve
payroll:salary:process
attendance:log:read
attendance:log:write
leave:request:read
leave:request:approve
recruitment:job:write
audit:read
```

**Problem**: All roles receive ALL permissions in the seeder:
```java
// DataSeeder.java lines 145-153
for (String roleName : roleIdMap.keySet()) {
    for (String pId : permIdMap.values()) {
        jdbcTemplate.update(
            "INSERT IGNORE INTO role_permission (role_id, permission_id, access_scope) VALUES (?, ?, 'COMPANY')",
            rId, pId
        );
    }
}
```

**This is a critical security flaw.** Every role, including `EMPLOYEE`, receives every permission including `payroll:salary:approve` and `payroll:salary:process`. The permission system is structurally bypassed at the seeding level.

### 2.2 @HasPermission Annotation Usage

`@HasPermission` annotation exists and is applied on controller methods. However:

1. **Wrong permission codes used**: Most controllers that should use domain-specific permissions (e.g., `leave:request:approve`, `payroll:salary:approve`) instead use generic `corehr:employee:read` / `corehr:employee:write` on unrelated modules:
   - `PayrollDisbursementController` — annotated with `corehr:employee:write`
   - `SuperAdminController` — annotated with `corehr:employee:read`
   - `BankPayrollController` — annotated with `corehr:employee:read`
   - `SsoController` — annotated with `corehr:employee:read`
   - All 66 module controllers pattern: most use `corehr:employee:read` or `corehr:employee:write` regardless of the actual resource

2. **Since ALL roles get ALL permissions, these annotations enforce nothing meaningful.**

3. **`PermissionAspect` admin bypass** (lines 68-79): If user has `ROLE_ADMIN`, `ROLE_SYSTEM_ADMIN`, or `ROLE_SUPER_ADMIN` in JWT, the entire permission check is skipped. Admin role derives from the JWT claim, not re-validated against the tenant DB.

---

## 3. Current Authorization Check Catalog (Service Layer)

### 3.1 Leave Module (`LeaveServiceImpl.java`)
- `canApproveLeave()` — checks roles by name (`IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'SYSTEM_ADMIN', 'HR_MANAGER', 'LINE_MANAGER')`) OR permission name `leave:request:approve`. **This is the BEST authorization logic in the codebase.**
- Self-approval check implemented. ✅
- Data scope: Employees see own requests; managers see all. ✅
- **Gap**: No workflow state machine. Status is directly mutated (`PENDING` → `APPROVED`/`REJECTED`). No intermediate states.

### 3.2 Expense Module (`ExpenseServiceImpl.java`)
- `isSuperAdmin()` — only checks for `SUPER_ADMIN` role.
- `getExpenses()` — Admins see all; others see own. **Uses only `SUPER_ADMIN`** (not `HR_MANAGER`, `FINANCE_ADMIN`).
- `approveExpense()` — Claims > $500 require Super Admin. **Hard-coded threshold, wrong role.**
- **No LINE_MANAGER approval tier.**
- **No multi-tier workflow** (Line Manager → Finance → Payment).

### 3.3 Payroll Module (`PayrollServiceImpl.java`)
- `runPayroll(email)` — runs payroll for the authenticated user's own salary. **No authorization check.**
- `getAllPayslips()` — returns all employees' payslips. **No authorization check.**
- **No workflow state machine.** Payslips are immediately created with status `'PAID'`.
- **No maker-checker separation.**

### 3.4 Employee Lifecycle (`EmployeeLifecycleServiceImpl.java`)
- `listEmployees()` — returns ALL employees. **No scope filter for LINE_MANAGER.**
- `updateEmployeeRole()` — anyone can call this; **no authorization check in service.**
- `inviteEmployee()` — no authorization check in service.
- `approveClearance()` — string concatenation SQL injection risk: `"UPDATE exit_clearance SET " + column + "_approved"`.

---

## 4. Current Roles (Seeded)

| Role | Is System Role | Description |
|---|---|---|
| `SYSTEM_ADMIN` | Yes | Full system access |
| `TENANT_ADMIN` | Yes | Workspace admin |
| `HR_MANAGER` | Yes | HR director |
| `LINE_MANAGER` | No | Supervisor |
| `FINANCE_ADMIN` | No | Finance CFO |
| `RECRUITER` | No | Talent acquisition |
| `AUDITOR` | No | Compliance auditor |
| `EMPLOYEE` | Yes | Standard employee |

**Missing from seed vs. documented hierarchy**: `GROUP_CHRO`, `CFO`, `PAYROLL_OFFICER`, `DEPARTMENT_HEAD`.

**Not in database at all**: `SUPER_ADMIN` (platform scope — correctly separate).

---

## 5. Existing Workflow Implementations

| Module | Workflow Type | Current State | Status |
|---|---|---|---|
| **Leave** | Approval | PENDING → APPROVED/REJECTED (direct) | ⚠️ Minimal — no intermediate states |
| **Expense** | Approval | PENDING → APPROVED/REJECTED (direct) | ⚠️ No multi-tier |
| **Payroll** | Run | Direct insert with status=PAID | ❌ No workflow |
| **Recruitment** | Pipeline | `status_stage` column: APPLIED/SCREENED/etc. | ⚠️ No controlled transitions |
| **Exit Clearance** | Multi-department | dept/it/finance booleans → CLEARED | ⚠️ Boolean flags, not a proper state machine |
| **Resignation** | Status | PENDING | ⚠️ No workflow |
| **Maker-Checker** | `maker_checker_request` table | Table exists in V52 | ⚠️ Table exists, no service implementation found |

---

## 6. Security Vulnerabilities Found

| # | Vulnerability | Location | Severity |
|---|---|---|---|
| V1 | All roles granted all permissions in seeder | `DataSeeder.java:145-153` | 🔴 CRITICAL |
| V2 | JWT secret hardcoded | `JwtUtils.java:15` | 🔴 CRITICAL |
| V3 | Payroll `runPayroll()` has no auth check | `PayrollServiceImpl.java:68` | 🔴 CRITICAL |
| V4 | `getAllPayslips()` exposes all salaries with no auth | `PayrollServiceImpl.java:111` | 🔴 CRITICAL |
| V5 | SQL injection via string concat in clearance approval | `EmployeeLifecycleServiceImpl.java:56` | 🔴 CRITICAL |
| V6 | `updateEmployeeRole()` has no authorization check | `EmployeeLifecycleServiceImpl.java:146` | 🔴 CRITICAL |
| V7 | Expense approval checks only `SUPER_ADMIN`, ignores `FINANCE_ADMIN` / `LINE_MANAGER` | `ExpenseServiceImpl.java:78` | 🔴 HIGH |
| V8 | `@HasPermission` annotations use wrong permission codes on most modules | All 66 module controllers | 🟠 HIGH |
| V9 | `access_scope` in `role_permission` is never evaluated — dead column | `PermissionAspect.java` | 🟠 HIGH |
| V10 | Roles from JWT not re-validated against DB on each request | `JwtAuthenticationFilter.java` | 🟠 HIGH |
| V11 | Employee can call `updateEmployeeRole` for any employee ID (IDOR) | `/employees/{id}/role` | 🟠 HIGH |
| V12 | `deleteRequest` for leave has no ownership check | `LeaveController.java:111` | 🟡 MEDIUM |
| V13 | `listEmployees()` returns all employees to any authenticated user | `EmployeeLifecycleServiceImpl.java:65` | 🟡 MEDIUM |

---

## 7. Duplicate / Inconsistent Logic

1. **Role check duplication**: `canApproveLeave()` in `LeaveServiceImpl` and `isSuperAdmin()` in `ExpenseServiceImpl` implement their own ad-hoc role check queries. Neither uses a central `AuthorizationService`.
2. **Permission naming inconsistency**: Seeded permissions use `corehr:employee:*`, `payroll:salary:*`, `leave:request:*` but the spec requires `employee.view`, `payroll.run.execute`, `leave.approve` format.
3. **No central authorization service exists.** Every module that needs to check permissions either queries the DB ad-hoc or ignores authorization entirely.

---

## 8. Missing Capabilities

| Capability | Status |
|---|---|
| Central `AuthorizationService` | ❌ Does not exist |
| Data scope enforcement (`DIRECT_REPORTS`, `DEPARTMENT`, `SELF`) | ❌ Not implemented |
| Multiple simultaneous roles for one user | ⚠️ Schema supports it, code treats as single role |
| Role assignment with effective dates | ❌ No `effective_from`/`effective_until` on `employee_role` |
| Workflow state machine (any module) | ❌ None — direct status mutation |
| Audit logging for RBAC changes | ❌ `enterprise_audit_log` table exists but no service writes to it |
| Approval delegation | ⚠️ `approval_delegation` table exists (V41) but no service implementation found |
| Leave balance transaction history | ❌ No `leave_balance_transactions` table |
| Salary change workflow | ❌ No controlled process |
| Compensation history | ❌ No `employee_compensation_history` table |
| Payroll state machine | ❌ Payslips go directly to `PAID` |
| Self-approval protection (expense/payroll) | ❌ Only implemented in leave |

---

## 9. Frontend Authorization

### Current `usePermissions.js` state:

```js
const hasPermission = (permissionName) => {
    if (hasRole('ADMIN') || hasRole('SYSTEM_ADMIN')) {
        return true;
    }
    return false;  // Always returns false for all non-admins regardless of permission name
};
```

**`hasPermission()` is broken.** It ignores the `permissionName` argument and only checks for ADMIN roles. No API call is made to validate permissions server-side. The permission name argument is dead code.

**`hasRole()` decodes the JWT locally** — roles are read from JWT payload without server re-validation.

---

## 10. Existing Tests

- **No test files found** in the backend `src/test/` directory during inspection.
- **No frontend test files** detected.

---

## 11. Migration Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Changing permission assignments breaks existing seeded data | Medium | Additive migration, not destructive |
| Changing `employee_role` to multi-role breaks `updateEmployeeRole()` in UI | Low | Add deprecation layer, update service |
| Changing `@HasPermission` codes will break existing controllers | Low | Rename in a single atomic change |
| JWT roles not synchronized with DB | Medium | Cache bust approach or token refresh endpoint |

---

## 12. Recommended Implementation Order

Based on the audit, the safest sequence is:

1. **Fix Critical Security Gaps First** (V1, V3, V4, V5, V6) — no schema change required
2. **Build Central `AuthorizationService`** — provides the foundation for all further phases
3. **Fix `@HasPermission` annotations** — map to correct domain permissions
4. **Fix seeder permission assignments** — role-specific permissions only
5. **Implement scope enforcement** in `AuthorizationService`
6. **Implement Leave workflow state machine** (most complete existing flow)
7. **Implement Expense workflow**
8. **Implement Payroll state machine**
9. **Implement Employee Lifecycle workflow**
10. **Add `effective_from/until` to role assignments**
11. **Fix `usePermissions.js`** to call API and return real data
12. **Add audit logging** to all sensitive actions
13. **Add tests**

---

## Phase Execution Status Tracker

| Phase | Title | Status |
|---|---|---|
| 0 | Repository & Architecture Audit | ✅ COMPLETE |
| 1 | Authorization Foundation | ⏳ PENDING |
| 2 | Role Management | ⏳ PENDING |
| 3 | Permission Management | ⏳ PENDING |
| 4 | Data Scope / Resource Authorization | ⏳ PENDING |
| 5 | Workflow Engine | ⏳ PENDING |
| 6 | Audit & Security Events | ⏳ PENDING |
| 7 | Leave Workflow | ⏳ PENDING |
| 8 | Employee Lifecycle | ⏳ PENDING |
| 9 | Salary & Compensation | ⏳ PENDING |
| 10 | Payroll | ⏳ PENDING |
| 11 | Expenses | ⏳ PENDING |
| 12 | Task / Work Management | ⏳ PENDING |
| 13 | Performance | ⏳ PENDING |
| 14 | Recruitment | ⏳ PENDING |
| 15 | Onboarding / Offboarding | ⏳ PENDING |
| 16 | Notifications | ⏳ PENDING |
| 17 | Frontend Integration | ⏳ PENDING |
| 18 | Security Testing | ⏳ PENDING |
| 19 | Integration / SIT Testing | ⏳ PENDING |
| 20 | Documentation & Cleanup | ⏳ PENDING |
