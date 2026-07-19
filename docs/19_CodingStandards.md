# Engineering Standards & Architecture: Awais HR

This document serves as the central index and entry point for all coding standards, architectures, and design rules for **Awais HR**.

To keep our guidelines maintainable and easy to navigate, we partition our engineering standards into specialized sub-documents. Developers must review and follow the standards matching their work focus area.

---

## 1. Core Core Principles

Every developer contributing code to Awais HR must adhere to our three core tenets:
1.  **Security First:** No performance optimization or feature delivery goal justifies bypassing tenant data isolation checks or cryptographic standards.
2.  **Explicit Design:** Readability and maintainability always take precedence over clever or highly-condensed implementations.
3.  **Strict Linting:** Zero warnings, zero security alerts, and full test coverage are required to merge pull requests.

---

## 2. Standards Directories & Sub-Documents

Please refer to the following sub-documents for detailed, language-specific guidelines:

### [Philosophy & General Rules](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/docs/standards/philosophy.md)
*   Development priorities (Security > Correctness > Maintainability > Speed).
*   Shared team conventions (documentation sync, test requirements).

### [Backend Engineering Standards](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/docs/standards/backend.md)
*   Java 21 standards (Records, switch pattern matching).
*   Spring Boot best practices (Virtual Threads config).
*   JPA & Hibernate rules (Lazy loading enforcement, transactional scopes).
*   MapStruct mappings and Lombok restrictions.

### [Frontend Engineering Standards](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/docs/standards/frontend.md)
*   JSX conventions (Separating API calls from presentation files).
*   Vanilla CSS & OKLCH color token rules.
*   State management structures (Zustand).
*   Accessibility guidelines (semantic HTML, unique IDs).

### [Security Coding Standards](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/docs/standards/security.md)
*   SQL injection prevention (parameterization requirements).
*   XSS & input sanitization rules.
*   Envelope encryption implementation.
*   Tenant isolation interceptor validation.
