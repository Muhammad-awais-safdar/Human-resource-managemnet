# Awais HR — Centralized Enterprise Audit Logging

## 1. Overview

Phase 7 establishes a centralized compliance audit logging system (`enterprise_audit_log`) designed for enterprise compliance (SOC 2, ISO 27001, GDPR). It captures all sensitive mutations, security events, financial workflows, and administrative actions across the platform.

---

## 2. Core Security & Compliance Guarantees

1. **Non-Sensitive Logging**: `AuditSanitizer` automatically inspects and redacts sensitive parameters (`password`, `secret`, `token`, `jwt`, `otp`, `pin`, `credit_card`) prior to database persistence.
2. **Correlation Tracking**: Every log entry includes a `correlation_id` to correlate API calls across microservices and sub-components.
3. **Multi-Tenant Scoping**: Audit records track `tenant_id` while remaining stored inside the tenant's isolated database.
4. **Declarative Audit Capture**: Developers can annotate sensitive service methods with `@Auditable(action = "PAYROLL_RUN", entity = "PayrollBatch")` to automatically capture execution results via `AuditAspect`.

---

## 3. Schema Reference (`V55__Centralized_Enterprise_Audit_Logging.sql`)

| Field | Type | Description |
|---|---|---|
| `id` | `VARCHAR(36)` | Unique log entry identifier |
| `tenant_id` | `VARCHAR(50)` | Tenant identifier context |
| `actor_email` | `VARCHAR(100)` | Authenticated user email |
| `action_type` | `VARCHAR(50)` | Action code (`LOGIN`, `SALARY_CHANGE`, `PAYROLL_RUN`, `ROLE_ASSIGNMENT`, etc.) |
| `entity_name` | `VARCHAR(100)` | Target domain entity name |
| `entity_id` | `VARCHAR(100)` | Target domain entity ID |
| `old_value` | `TEXT` | Pre-mutation state (Sanitized) |
| `new_value` | `TEXT` | Post-mutation state (Sanitized) |
| `details` | `TEXT` | Execution description & metadata |
| `ip_address` | `VARCHAR(50)` | Client IP address |
| `user_agent` | `VARCHAR(255)` | HTTP User Agent header |
| `correlation_id` | `VARCHAR(100)` | Distributed trace / correlation ID |
| `performed_at` | `TIMESTAMP` | Timestamp of event execution |

---

## 4. REST APIs Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/suite/audit-center/logs` | Fetch recent enterprise audit logs |
| `POST` | `/api/v1/suite/audit-center/logs` | Record a compliance audit event |
| `GET` | `/api/v1/suite/audit-center/export` | Download audit log ledger as CSV |
