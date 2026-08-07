# 28 — Frontend Coding Standards: Strict TypeScript & ESLint Rules

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: All Frontend Engineers, Code Reviewers, Tech Leads
- **Design System Cross-Reference**: `docs/ui-ux/39_UI_Coding_Standards.md`, `docs/ui-ux/45_UI_Anti_Patterns.md`

---

## 1. Purpose

This document details the code formatting standards, strict TypeScript configurations, ESLint rule enforcement, and pre-commit hooks for **Awais HR**.

---

## 2. Scope

This specification governs all `.ts`, `.tsx`, `.css`, and JSON files written inside the `frontend/` directory.

---

## 3. Standards & Linting Rules

### 3.1 Strict TypeScript & ESLint Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND CODING ENFORCEMENT RULES                                      │
├─────────────────┬──────────────────────────────────────────────────────┤
│ LINT RULE       │ ENFORCEMENT SPECIFICATION                            │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Strict Type Check│ `strict: true` in `tsconfig.json`. `noImplicitAny: true`│
│ Zero Inline Style│ `react/inline-styles` set to ERROR in ESLint         │
│ Unused Imports  │ `no-unused-vars` set to ERROR; auto-removed on save  │
│ React Hooks     │ `react-hooks/rules-of-hooks` set to ERROR            │
│ Prettier Format │ 2 spaces tab, single quotes, semi-colons enabled     │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & Config Directory

```
frontend/
├── .eslintrc.json                  # Master ESLint Configuration Rules
├── .prettierrc                     # Prettier Code Formatter Settings
├── tsconfig.json                   # Strict TypeScript Compiler Config
└── .husky/                         # Git Pre-Commit Hooks
    └── pre-commit                 # Runs lint-staged & typecheck
```

---

## 5. Naming Conventions

- **Variables & Functions**: camelCase (e.g. `calculateGrossPay`).
- **Interfaces & Types**: PascalCase (e.g. `EmployeeRecord`).
- **Constants**: UPPER_SNAKE_CASE (e.g. `DEFAULT_PAGE_SIZE = 25`).

---

## 6. Implementation Code Contracts

```json
// Master ESLint Rules Configuration (.eslintrc.json)
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

---

## 7. Best Practices

- **Never Use `any`**: Use explicit interfaces, generics, or `unknown` with type narrowing guards rather than raw `any`.
- **Run Type Checks in CI**: Ensure `tsc --noEmit` runs automatically in CI pipelines before allowing code merges.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** use Husky pre-commit hooks to format code with Prettier before commits are recorded.
- **DO** extract complex inline logic into descriptive helper functions.

### Don'ts
- **DON'T** disable ESLint warnings with `// eslint-disable-next-line` without team lead approval.
- **DON'T** mix `var` declarations into modern TypeScript code (always use `const` or `let`).

---

## 9. Dependencies Reference

- `eslint`: Static code analysis engine
- `prettier`: Code formatter
- `husky` & `lint-staged`: Pre-commit git hooks

---

## 10. Implementation Notes

Formatting and lint checks execute automatically on git commit, blocking non-compliant code from entering the repository.
