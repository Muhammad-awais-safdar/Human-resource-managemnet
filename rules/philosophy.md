# Rule: Core Philosophy & Priorities

This file defines the primary priorities and decision-making weights for AI code generation.

---

## 1. Priority Hierarchy

When generating code, modifying APIs, or creating database structures, you MUST adhere to this exact hierarchy:

```
Security > Correctness > Maintainability > Performance > Short-term Velocity
```

*   **Security:** Always prioritize tenant data isolation, input sanitization, and cryptographic key protections.
*   **Correctness:** Prefer explicit, readable code over clever or highly-condensed implementations.
*   **Maintainability:** Ensure code matches structural conventions so that modifications can be made without introducing regression bugs.

---

## 2. Hard Constraints

1.  **Strict Linting:** Ensure all generated files conform to clean Java 21 formatting and standard ESLint patterns.
2.  **Explicit Type Declarations:** Do not use generic objects or dynamic maps where static, type-safe structures (like Java Records) can be defined.
3.  **Self-Documenting Code:** Write self-documenting code with clear variable naming rather than relying on inline comments.
