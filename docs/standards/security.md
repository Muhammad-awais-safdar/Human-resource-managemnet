# Security Coding Standards: Awais HR

This document details security coding rules, sanitization practices, and validation checks required for developing the **Awais HR** platform.

---

## 1. SQL Injection Prevention

*   **Parameterized Queries:** Direct SQL string concatenation is strictly forbidden. Developers must use Spring Data JPA or named parameters for all database interactions.
*   **Hibernate Criteria API:** When building dynamic search queries, use the Jpa Specification Criteria API. Never construct raw SQL strings dynamically.

---

## 2. Cross-Site Scripting (XSS) & Input Sanitization

*   **Sanitize Inputs:** All user input submitted to rich-text fields (like job descriptions or emails) must be sanitized on the backend using the Jsoup library with a strict whitelist.
*   **Secure Headers:** The API Gateway must inject standard security headers:
    ```http
    Content-Security-Policy: default-src 'self';
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    ```

---

## 3. Envelope Encryption Implementation

*   **Cryptographic Keys:** Plaintext encryption keys must never be committed to source code or configuration files. They must be retrieved dynamically at runtime from AWS KMS or HashiCorp Vault.
*   **Cipher Selection:** Use `AES/GCM/NoPadding` with a 256-bit key size for symmetric encryption of sensitive data. Do not use older, vulnerable modes like ECB or CBC.

---

## 4. Tenant Context Validation

*   **Request Interceptors:** Every service layer action must check the ThreadLocal tenant context. If an operation tries to access records belonging to another tenant ID, the request must fail immediately with a `SecurityException` and log a high-severity alert.
