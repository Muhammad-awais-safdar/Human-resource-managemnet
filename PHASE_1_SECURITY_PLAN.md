# Phase 1 — Security Hardening Execution Plan

> **Objective**: Eliminate five critical security vulnerabilities discovered during Phase 0 audit before advancing to RBAC and Workflow refactoring.

---

## 1. Targeted Vulnerabilities & Resolution Strategy

### Vulnerability #1: DataSeeder Grants All Permissions to All Roles (`DataSeeder.java`)
- **Root Cause**: `DataSeeder.java` loops over all roles and grants all permissions to every role in the DB using `INSERT IGNORE INTO role_permission`.
- **Fix**: Define role-specific permission mapping sets in `DataSeeder.java`:
  - `SYSTEM_ADMIN` / `TENANT_ADMIN`: All permissions.
  - `HR_MANAGER`: `corehr:employee:read`, `corehr:employee:write`, `corehr:org:write`, `leave:request:read`, `leave:request:approve`, `recruitment:job:write`, `attendance:log:read`, `attendance:log:write`.
  - `LINE_MANAGER`: `corehr:employee:read`, `leave:request:read`, `leave:request:approve`, `attendance:log:read`.
  - `FINANCE_ADMIN`: `payroll:salary:read`, `payroll:salary:write`, `payroll:salary:approve`, `payroll:salary:process`, `audit:read`.
  - `RECRUITER`: `recruitment:job:write`, `corehr:employee:read`.
  - `AUDITOR`: `audit:read`, `corehr:employee:read`, `payroll:salary:read`.
  - `EMPLOYEE`: `corehr:employee:read` (self view), `leave:request:read` (self view), `attendance:log:read` (self view), `payroll:salary:read` (self payslips).
- **Verification**: Query `role_permission` in database seeder check; verify `EMPLOYEE` role does not possess `payroll:salary:approve` or `payroll:salary:process`.

---

### Vulnerability #2: Unprotected Payroll Run Execution (`PayrollServiceImpl.java` & `PayrollController.java`)
- **Root Cause**: `PayrollServiceImpl.runPayroll(email)` executes payroll calculations without verifying if the actor possesses payroll processing permissions. `PayrollController.runPayroll()` lacks `@HasPermission`.
- **Fix**:
  - Add `@HasPermission("payroll:salary:process")` to `PayrollController.runPayroll()`.
  - Add server-side permission check inside `PayrollServiceImpl.runPayroll()` to ensure actor email has `payroll:salary:process` or `payroll:salary:write` permission or admin role.
- **Verification**: Invoke `POST /payroll/run` with `EMPLOYEE` token -> Expect `403 Forbidden` / `SecurityException`.

---

### Vulnerability #3: Confidentiality Breach via Unrestricted Payslip Access (`PayrollServiceImpl.java` & `PayrollController.java`)
- **Root Cause**: `PayrollServiceImpl.getAllPayslips()` exposes all employee payslips to any caller without authorization check.
- **Fix**:
  - Add `@HasPermission("payroll:salary:read")` to `PayrollController.getAllPayslips()`.
  - Validate in `PayrollServiceImpl.getAllPayslips()` or `PayrollController` that only users with `payroll:salary:read` / `payroll:salary:approve` or finance/HR/admin roles can access company-wide payslips.
- **Verification**: Access `/payroll/all-payslips` with `EMPLOYEE` user -> Expect `403 Forbidden`.

---

### Vulnerability #4: SQL Injection in Exit Clearance Approval (`EmployeeLifecycleServiceImpl.java`)
- **Root Cause**: Line 56: `"UPDATE exit_clearance SET " + column + "_approved = TRUE WHERE id = ?"` dynamically concatenates user-provided string `dto.getDepartment()`.
- **Fix**: Map `dto.getDepartment()` against an allowlist of valid department columns (`department`, `it`, `finance`). If invalid/unmatched, throw `IllegalArgumentException`.
- **Verification**: Pass malicious input like `department_approved = TRUE, status = 'CLEARED'; --` -> Rejected with `IllegalArgumentException`.

---

### Vulnerability #5: Hardcoded Production JWT Secret (`JwtUtils.java` & `application.properties`)
- **Root Cause**: `JwtUtils.java` contains hardcoded secret key string.
- **Fix**:
  - Externalize secret key via `@Value("${jwt.secret:awais_hr_enterprise_secure_jwt_token_secret_key_256_bits_long}")` in `JwtUtils.java`.
  - Configure `jwt.secret=${JWT_SECRET:awais_hr_enterprise_secure_jwt_token_secret_key_256_bits_long}` in `application.properties`.
- **Verification**: Verify application loads secret from Spring Environment and fails gracefully or uses fallback default in dev environment.

---

## 2. Quality Gate Checklist
- [ ] Application compiles without errors (`mvn compile`)
- [ ] Unit & Security tests run and pass (`mvn test`)
- [ ] EMPLOYEE role cannot execute payroll
- [ ] EMPLOYEE role cannot access company-wide payslips
- [ ] SQL Injection vector in exit clearance is blocked
- [ ] JWT secret is externalized to properties/environment
- [ ] DataSeeder provisions role-specific permission maps
