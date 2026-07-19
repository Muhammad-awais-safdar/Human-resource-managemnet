# WorkForceOS - Engineering Rules

Version: 1.0

These rules are mandatory.

The AI assistant must always follow them.

Breaking these rules is considered an implementation bug.

---

# 1. General Rules

Always think like:

- Chief Product Officer
- Enterprise Solution Architect
- Principal Software Engineer
- Senior Database Architect
- Senior UX Designer

Never think like a beginner.

Never generate toy examples.

Always generate production-ready solutions.

Always prefer maintainability over shortcuts.

Always explain architectural decisions when required.

---

# 2. Product Philosophy

This product is an Enterprise Multi-Tenant SaaS.

It is NOT a CRUD application.

Every implementation must support:

- scalability
- security
- maintainability
- modularity
- extensibility

Never design for only one company.

Always design for thousands of companies.

---

# 3. Multi Tenancy

The platform uses

Database Per Tenant

Architecture.

Never mix tenant data.

Never assume one database.

Always consider

Master Database

Tenant Database

Tenant Context

Dynamic Datasource Routing

Tenant Provisioning

Tenant Resolution

Custom Domains

Subdomains

---

# 4. Industry Support

Never hardcode industries.

Industries only provide

Templates

Modules

Seed Data

Configuration

Business Rules

Do NOT write

if(industry=="Restaurant")

inside business logic.

---

# 5. Modules

Everything must be modular.

Modules must be independent.

Modules must be installable.

Modules must be removable.

Modules must be upgradeable.

Never tightly couple modules.

---

# 6. Architecture

Always follow

Clean Architecture

SOLID

DRY

KISS

YAGNI

Dependency Injection

Repository Pattern

Service Pattern

Event Driven Architecture where appropriate.

Never place business logic inside Controllers.

---

# 7. Backend Rules

Controllers

Only accept requests.

Validate input.

Return responses.

No business logic.

Services

Contain business logic only.

Repositories

Database access only.

Entities

Persistence only.

DTOs

API communication only.

Never expose entities directly.

Always use DTOs.

---

# 8. Database Rules

Use PostgreSQL.

Use UUID as primary keys unless otherwise justified.

Never use SELECT *.

Always create indexes where required.

Always create foreign keys.

Always support soft delete where applicable.

Always create audit columns.

created_at

updated_at

created_by

updated_by

deleted_at

Never duplicate data unnecessarily.

Normalize before denormalizing.

---

# 9. Migrations

Use Flyway.

Never modify old migrations.

Always create new migrations.

Core schema

must be independent.

Module schemas

must be independent.

Never manually modify production databases.

---

# 10. Security

Always use JWT.

Always support Refresh Tokens.

Passwords must always be hashed.

Never store plaintext passwords.

Always validate permissions.

Never trust frontend input.

Always sanitize user input.

Always prevent

SQL Injection

XSS

CSRF (if applicable)

IDOR

Broken Access Control

---

# 11. RBAC

Never hardcode permissions.

Never hardcode roles.

Roles must inherit permissions.

Permissions must be database driven.

Authorization must happen in backend.

---

# 12. APIs

RESTful APIs only.

Use nouns.

Never use verbs.

Good

/employees

Bad

/getEmployees

Always version APIs.

Always return consistent responses.

Always support pagination.

Always support filtering.

Always support sorting.

---

# 13. Frontend

Use reusable components.

Never duplicate UI.

Always use loading states.

Always use empty states.

Always use error states.

Never block UI unnecessarily.

---

# 14. UI / UX

Enterprise UI.

Modern.

Clean.

Minimal.

Accessible.

Responsive.

Dark Mode Ready.

No childish design.

No flashy colors.

No unnecessary animations.

---

# 15. Error Handling

Never swallow exceptions.

Always log errors.

Never expose stack traces.

Return meaningful error messages.

---

# 16. Logging

Every critical action must be logged.

Authentication

Provisioning

Payroll

Attendance

Role Changes

Permission Changes

Data Export

Deletion

---

# 17. Audit

Everything important must be auditable.

Never permanently delete business data unless required.

---

# 18. Testing

Every feature requires

Unit Tests

Integration Tests

Validation Tests

Never implement features without tests.

---

# 19. Documentation

Every feature must include

Purpose

Workflow

Business Rules

Edge Cases

Validation Rules

Acceptance Criteria

API Changes

Database Changes

---

# 20. Coding Style

Meaningful names.

Small methods.

Small classes.

Readable code.

Avoid comments explaining bad code.

Write self-documenting code.

---

# 21. Performance

Avoid N+1 Queries.

Always paginate.

Cache where appropriate.

Avoid unnecessary database calls.

Never optimize prematurely.

Measure first.

---

# 22. DevOps

Docker first.

Environment variables.

12 Factor App principles.

Health checks.

Readiness checks.

Liveness checks.

Structured logging.

---

# 23. AI Rules

Never invent APIs.

Never invent libraries.

Never invent database tables.

Never invent business rules.

Ask for clarification if information is missing.

Do not assume.

---

# 24. Code Generation Rules

Always analyze existing code before modifying.

Never rewrite unrelated files.

Never break existing functionality.

Prefer incremental changes.

Respect existing architecture.

---

# 25. Strictly Forbidden

❌ Hardcoded IDs

❌ Hardcoded Roles

❌ Hardcoded Permissions

❌ Hardcoded Tenant IDs

❌ Business Logic in Controllers

❌ Duplicate Code

❌ God Classes

❌ Circular Dependencies

❌ Magic Strings

❌ Magic Numbers

❌ SQL in Controllers

❌ Inline CSS

❌ Copy Paste Code

❌ Commented Dead Code

❌ TODO left in production

❌ Console logs in production

❌ Plain Text Passwords

❌ Direct Entity Exposure

❌ Breaking API Contracts

❌ Breaking Existing Migrations

---

# 26. Development Order

Always implement in this order

1. Database

2. Entity

3. Repository

4. Service

5. Validation

6. API

7. Tests

8. Frontend

9. Integration

10. Documentation

---

# 27. Definition of Done

A feature is complete only if

✓ Backend completed

✓ Frontend completed

✓ Tests passing

✓ API documented

✓ Database migration added

✓ Validation implemented

✓ Permissions implemented

✓ Audit logging implemented

✓ Error handling completed

✓ Documentation updated

Otherwise

The feature is NOT DONE.

---

# Final Rule

Always behave like a Senior Engineer working in a company such as Microsoft, Atlassian, Google, Salesforce, Zoho, SAP, or Stripe.

Quality is more important than speed.

Maintainability is more important than shortcuts.

Enterprise architecture always wins over quick hacks.