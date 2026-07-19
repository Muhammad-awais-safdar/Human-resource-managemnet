# Rule: Security & Access Control

This file details security regulations, dynamic permission configurations, and cryptography designs.

---

## 1. Dynamic Permission-Based Authorization

*   **No Hardcoded Roles:** You must **never** check roles directly inside controller code (e.g., checking `hasRole('ROLE_ADMIN')` is forbidden).
*   **Permission Annotations:** All API routes must be protected using explicit permission keys assigned dynamically to custom user roles:
    ```java
    @PreAuthorize("hasAuthority('payroll:run:execute')")
    ```
*   **Token Authorization:** JWT tokens contain dynamic permission lists generated from the database at login.

---

## 2. SQL Sanitization & Injection Controls

*   **Parameterized Queries:** Direct SQL string concatenation is strictly forbidden. Use Spring Data JPA, named query parameters, or Jpa Specification Criteria API for all database interactions.
*   **Input Sanitization:** All user input submitted to rich-text fields (like job descriptions or emails) must be sanitized on the backend using a strict whitelist.

---

## 3. Data Protection & Isolation

*   **Envelope Encryption:** Symmetric encryption of columns (salary figures, tax inputs) must utilize AES-256 GCM envelope encryption. Plaintext encryption keys must never be hardcoded and must be retrieved dynamically from AWS KMS or HashiCorp Vault.
*   **Row-Level Security (RLS):** Configure PostgreSQL RLS policies on transaction-critical tables (`payslip`, `attendance_log`) to restrict record visibility to the active user context.
