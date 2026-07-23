# Quality Assurance & Audit Report: WorkForceOS (Awais HR)

**Document Version:** 1.0  
**Project:** WorkForceOS (Awais HR Management System)  
**Status:** Active QA Audit & Remediation Tracker  
**Target Architecture:** Java 21 (Spring Boot 3.x) + React 19 (Next.js App Router) + PostgreSQL (Database-per-Tenant)

---

## Executive Summary

This Quality Assurance (QA) audit evaluates the **WorkForceOS / Awais HR** codebase, database schemas, API specs, and frontend implementations against the core engineering rules specified in `rules/RULES.md`, `rules/backend.md`, `rules/frontend.md`, `rules/database.md`, and `rules/security.md`.

The report classifies findings into four severity levels:
* 🔴 **CRITICAL:** High risk to tenant data isolation, security vulnerabilities, or architecture rule violations.
* 🟠 **HIGH:** Functional gaps, rule non-compliance (e.g. Java 21 Record usage), or missing core workflows.
* 🟡 **MEDIUM:** Performance risks, test coverage gaps, or UI/UX styling token inconsistencies.
* 🔵 **LOW:** Code cleanliness, documentation updates, or minor refactoring items.

---

## Summary Matrix

| Category | Critical | High | Medium | Low | Total Issues |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Architecture & Multi-Tenancy** | 0 | 1 | 2 | 1 | **4** |
| **2. Backend & Java 21 Standards** | 0 | 3 | 2 | 1 | **6** |
| **3. Security & Access Control** | 1 | 2 | 1 | 0 | **4** |
| **4. Database & Flyway Migrations** | 0 | 2 | 2 | 1 | **5** |
| **5. Frontend & React 19 Rules** | 0 | 2 | 3 | 1 | **6** |
| **6. Testing & Quality Automation** | 0 | 1 | 3 | 1 | **5** |
| **7. Feature Gaps (Phases 61–68)** | 1 | 4 | 3 | 0 | **8** |
| **TOTAL** | **2** | **15** | **16** | **5** | **38** |

---

## 1. Architecture & Multi-Tenancy Audit

### [QA-ARCH-001] HikariCP Connection Pool Exhaustion under Peak Multi-Tenant Load
* **Severity:** 🟠 HIGH
* **Rule Reference:** `rules/RULES.md` (Section 3 - Dynamic Datasource Routing)
* **Location:** `backend/src/main/java/com/awais/hr/config/multitenant/`
* **Issue Description:** Each active tenant provisions a dynamic `HikariDataSource` connection pool. Without aggressive idle-timeout tuning, pool eviction policies, and maximum pool size caps per tenant, scaling to hundreds of tenants can exhaust database server connection limits.
* **Remediation Plan:** Configure explicit connection eviction timeouts (`maxLifetime = 600000`, `idleTimeout = 300000`, `maximumPoolSize = 10`) and dynamic pool closure for inactive tenants in `RoutingDataSourceLookup`.

### [QA-ARCH-002] Cross-Domain SQL Query Prevention Enforcement
* **Severity:** 🟡 MEDIUM
* **Rule Reference:** `docs/03_Architecture.md` (Section 7.1 - Backend Module Boundaries)
* **Location:** `backend/src/main/java/com/awais/hr/module/`
* **Issue Description:** Cross-domain JPA queries must not join tables belonging to another domain module (e.g. `payroll` joining `employee` tables directly).
* **Remediation Plan:** Enforce interface-first communication using public domain module services (e.g. `EmployeeInfoService`) rather than direct repository cross-injection.

---

## 2. Backend & Java 21 Standards Audit

### [QA-JAVA-001] Non-Compliance: DTOs using Lombok `@Data` instead of Java 21 `record`
* **Severity:** 🟠 HIGH
* **Rule Reference:** `rules/backend.md` (Section 1 - Java 21 Coding Conventions)
* **Location:** All DTO classes (e.g., `LeaveRequestDTO`, `ExpenseClaimRequestDTO`, `CheckInRequestDTO`, `ResignationRequestDTO`, `TimesheetLogRequestDTO`, `DocumentUploadRequestDTO`)
* **Issue Description:** `rules/backend.md` strictly dictates: *"Use Java record declarations for all data structures (DTOs, Webhook payloads, Event logs). Do not use mutable standard classes."* Currently, DTOs are written as standard Lombok classes with `@Data`.
* **Remediation Plan:** Refactor all DTO classes to immutable Java 21 `record` types:
  ```java
  public record LeaveRequestDTO(
      UUID employeeId,
      UUID leaveTypeId,
      LocalDate startDate,
      LocalDate endDate,
      String reason
  ) {}
  ```

### [QA-JAVA-002] Manual Mapping Loops in Place of MapStruct Interfaces
* **Severity:** 🟡 MEDIUM
* **Rule Reference:** `rules/backend.md` (Section 3 - Libraries & Mapper Settings)
* **Location:** Service implementation classes (`PayrollServiceImpl`, `AssetServiceImpl`)
* **Issue Description:** MapStruct interfaces must be used for all DTO mapping operations. Manual object instantiation and property copying loop patterns are present in selected service methods.
* **Remediation Plan:** Define dedicated MapStruct mapper interfaces (`@Mapper(componentModel = "spring")`) for each domain module.

### [QA-JAVA-003] Hardcoded Statutory Tax Calculation in Payroll Engine
* **Severity:** 🟠 HIGH
* **Rule Reference:** `rules/RULES.md` (Section 25 - Strictly Forbidden: Magic Numbers / Hardcoded Rules)
* **Location:** `backend/src/main/java/com/awais/hr/module/payroll/service/PayrollServiceImpl.java`
* **Issue Description:** The payroll processing service uses a fixed tax rule (`10% tax if gross salary > $3000`). This violates multi-country and configurable salary structure requirements.
* **Remediation Plan:** Implement Phase 66 (Dynamic Salary Structure Builder) to calculate tax slabs and components dynamically from database-configured tax bands.

---

## 3. Security & Access Control Audit

### [QA-SEC-001] Missing Field Envelope Encryption for Sensitive HR Data
* **Severity:** 🔴 CRITICAL
* **Rule Reference:** `rules/security.md` (Section 3 - Data Protection & Isolation)
* **Location:** `backend/src/main/java/com/awais/hr/module/employee/` & `payroll/`
* **Issue Description:** Employee identity numbers (passport, national ID, tax IDs) and salary figures are stored unencrypted in PostgreSQL tables.
* **Remediation Plan:** Implement AES-256 GCM envelope encryption converters (`@Convert(converter = EncryptedStringAttributeConverter.class)`) integrated with AWS KMS / HashiCorp Vault.

### [QA-SEC-002] Missing Dynamic Permission Annotation Enforcement on Webhooks
* **Severity:** 🟠 HIGH
* **Rule Reference:** `rules/security.md` (Section 1 - Dynamic Permission-Based Authorization)
* **Location:** Webhook and integration API controllers
* **Issue Description:** Ensure all API endpoints are guarded by explicit permission keys (e.g. `@PreAuthorize("hasAuthority('integration:webhook:write')")`) and reject unauthenticated requests.
* **Remediation Plan:** Audit all REST endpoints and add explicit `@PreAuthorize` permission keys matching `permission.code` records.

---

## 4. Database & Flyway Migrations Audit

### [QA-DB-001] Soft Delete Filter Missing on Global Unique Indexes
* **Severity:** 🟠 HIGH
* **Rule Reference:** `rules/database.md` (Section 2 - Soft Delete Enforcement)
* **Location:** `backend/src/main/resources/db/migration/tenant/`
* **Issue Description:** Unique indexes on soft-deleted tables (e.g., `employee(email)`, `department(code)`) must include `WHERE deleted_at IS NULL` to prevent unique constraint failures when re-creating records with previously used emails/codes.
* **Remediation Plan:** Update Flyway migration scripts to construct partial unique indexes:
  ```sql
  CREATE UNIQUE INDEX uq_employee_email ON employee(email) WHERE (deleted_at IS NULL);
  ```

### [QA-DB-002] Hibernate Soft-Delete Automatic Filtering `@Where` Annotation Verification
* **Severity:** 🟡 MEDIUM
* **Rule Reference:** `rules/database.md` (Section 2 - Soft Delete Enforcement)
* **Location:** Domain Entities (`backend/src/main/java/com/awais/hr/module/*/model/`)
* **Issue Description:** Standard JPA `findAll()` queries could return soft-deleted records if entities lack `@SQLDelete` and `@Where(clause = "deleted_at IS NULL")` or Hibernate 6 `@SoftDelete`.
* **Remediation Plan:** Annotate all soft-deletable entities with `@SQLDelete` and `@Where(clause = "deleted_at IS NULL")`.

---

## 5. Frontend & React 19 Rules Audit

### [QA-FE-001] Direct Form Handling in place of React 19 Native Form Actions
* **Severity:** 🟠 HIGH
* **Rule Reference:** `rules/frontend.md` (Section 1 - Component Rules & Separation)
* **Location:** `frontend/src/app/(dashboard)/` form components
* **Issue Description:** `rules/frontend.md` requires all form mutations to leverage React 19 native `action` attributes with `useActionState` and `useFormStatus` hooks rather than legacy `e.preventDefault()` handlers.
* **Remediation Plan:** Refactor form mutation pipelines across dashboard views to use React 19 Form Actions:
  ```jsx
  const [state, formAction, isPending] = useActionState(submitAction, initialState);
  return <form action={formAction}>...</form>;
  ```

### [QA-FE-002] Direct Hardcoded Color Values instead of OKLCH Tokens
* **Severity:** 🟡 MEDIUM
* **Rule Reference:** `rules/frontend.md` (Section 2 - Styling Conventions)
* **Location:** `frontend/src/styles/` & CSS Module files
* **Issue Description:** Selected style files contain legacy hex codes (e.g. `#1e293b`, `#3b82f6`) instead of centralized OKLCH color variables (`var(--color-primary)`, `var(--color-bg)`).
* **Remediation Plan:** Replace all raw hex/rgb values with OKLCH CSS variables declared in the global design system.

---

## 6. Testing & Quality Automation Audit

### [QA-TST-001] Dynamic Multi-Tenant Header Routing Integration Test Gap
* **Severity:** 🟠 HIGH
* **Rule Reference:** `rules/RULES.md` (Section 18 - Testing)
* **Location:** `backend/src/test/java/com/awais/hr/`
* **Issue Description:** Unit tests exist for business services, but full integration tests using MockMvc or Testcontainers that send requests with varying `Host` headers (e.g. `acme.awais-hr.com`) to verify end-to-end multi-tenant routing need broader automated execution.
* **Remediation Plan:** Create `TenantRoutingIntegrationTest.java` using Spring Boot Test + Testcontainers PostgreSQL to test dynamic host header switching under concurrent requests.

---

## 7. Extended Feature Gap Analysis (Phases 61–68)

| QA Code | Phase Name | Status | Key Missing Deliverable |
| :--- | :--- | :--- | :--- |
| **QA-GAP-061** | Subscription & Billing | 🔴 CRITICAL | Stripe webhook processing, PDF invoice generator, seat proration logic. |
| **QA-GAP-062** | Super Admin Dashboard | 🟠 HIGH | Cross-tenant admin control panel, tenant impersonation token service. |
| **QA-GAP-063** | SSO & SAML 2.0 | 🟠 HIGH | SAML 2.0 IdP metadata XML parser, SCIM 2.0 `/scim/v2/Users` auto-sync. |
| **QA-GAP-064** | Unified Approvals Inbox | 🟡 MEDIUM | Sidebar real-time pending count badge, bulk approve/reject action API. |
| **QA-GAP-065** | Employee 360 Profile | 🟡 MEDIUM | Skills radar chart, career timeline graph, private manager notes tab. |
| **QA-GAP-066** | Dynamic Salary Builder | 🟠 HIGH | Custom taxable component designer, pay grade matrices, arrears calculator. |
| **QA-GAP-067** | Smart Notification Center | 🟡 MEDIUM | In-app notification bell dropdown, SSE streaming endpoint (`/stream`). |
| **QA-GAP-068** | Direct Deposit Banking | 🟠 HIGH | NACHA / BACS / SIF payroll disbursement file generators. |

---

## QA Remediation Roadmap & Action Checklist

- [ ] **Step 1:** Convert all backend DTO classes from Lombok `@Data` classes to Java 21 `record`s (**QA-JAVA-001**).
- [ ] **Step 2:** Add partial unique index constraints (`WHERE deleted_at IS NULL`) across all Flyway migrations (**QA-DB-001**).
- [ ] **Step 3:** Implement AES-256 GCM envelope encryption converters for sensitive personal and salary data (**QA-SEC-001**).
- [ ] **Step 4:** Refactor frontend forms to leverage React 19 native `action` and `useActionState` hooks (**QA-FE-001**).
- [ ] **Step 5:** Complete Phase 61 (Subscription & Billing) and Phase 66 (Dynamic Salary Structure Builder) (**QA-GAP-061**, **QA-GAP-066**).
