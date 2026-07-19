# Engineering Philosophy: Awais HR

This document details the core development principles and engineering values that guide all contributions to the **Awais HR** platform.

---

## 1. Core Principles Hierarchy

When design decisions or implementation patterns conflict, developers must follow our priority guide:

```
Security > Correctness > Maintainability > Performance > Short-term Velocity
```

*   **Security First:** We process personal data, contracts, and banking details. We do not compromise on data isolation or encryption controls for performance or speed.
*   **Correctness Over Cleverness:** We value explicit, readable code over short, complex, or "clever" implementations. Code is read many more times than it is written.
*   **Maintainability:** Code must be structured so that a new engineer can understand and modify it without introducing regression errors.

---

## 2. Shared Tenets

1.  **Strict Linting & Zero Warnings:** Code must build with zero compiler warnings, zero linter issues, and pass all security scanners (Trivy, SonarQube) before merging.
2.  **Test Requirement:** Every bug fix or feature addition must include accompanying unit and integration tests.
3.  **Document Updates:** If a public API signature or system-wide configuration is changed, developers must update the corresponding OpenAPI / markdown specs in the same pull request.
