# Quality Assurance & Audit Index (QA)

> **Main QA Document Location:** [`docs/QA_Issues.md`](docs/QA_Issues.md)

This project maintains a central Quality Assurance & Audit Tracker documenting all identified issues, rule compliance checks, security audits, database migration checks, and feature gap analyses against `@rules` and `@docs`.

---

## Key Highlights

- 🔴 **2 Critical Issues:** Field Envelope Encryption for sensitive data (`QA-SEC-001`), Subscription & Billing Engine (`QA-GAP-061`).
- 🟠 **15 High Severity Issues:** DTO refactoring to Java 21 `record` types (`QA-JAVA-001`), partial unique indexes for soft deletes (`QA-DB-001`), dynamic salary structure builder (`QA-JAVA-003`), React 19 form action refactoring (`QA-FE-001`), SAML 2.0 SSO (`QA-GAP-063`).
- 🟡 **16 Medium Severity Issues:** HikariCP connection pool eviction tuning (`QA-ARCH-001`), MapStruct mapping interfaces (`QA-JAVA-002`), OKLCH styling token standardization (`QA-FE-002`), Unified Approvals Inbox completion (`QA-GAP-064`).
- 🔵 **5 Low Severity Refactoring Items:** Code formatting, unused imports cleanup, documentation sync.

Refer to [`docs/QA_Issues.md`](docs/QA_Issues.md) for the full detailed audit matrix, remediation plans, and step-by-step action checklist.

---

## Recently Resolved Issues

- ✅ **Fixed Tenant Metadata Seeding (`TenantService.java`):** Added `fetchPermissionId()` lookup logic and `ON CONFLICT DO NOTHING` for role/permission seeding, resolving the foreign key constraint error (`role_permission_permission_id_fkey`) when binding roles to pre-seeded permissions from Flyway migrations (`V15`).
- ✅ **Fixed Suite Controller Route Paths (9 Controllers):** Removed duplicate `/api/v1` prefixes from `@RequestMapping` in Phase 26–34 controllers (`WorkflowController`, `CommunicationController`, `ReportController`, `IntegrationController`, `MobileSyncController`, `AiAutomationController`, `ComplianceController`, `PlatformSettingsController`, `EnterpriseFeaturesController`), eliminating 500 server errors when fetching suite resources.
- ✅ **Fixed Invite Employee UI Overflow (`lifecycle/page.js` & `globals.css`):** Applied universal `box-sizing: border-box` reset and flex-basis wrapping (`flex: '1 1 140px'`) on input groups, resolving input field overflow out of form cards on the `/lifecycle` page.