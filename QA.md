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
