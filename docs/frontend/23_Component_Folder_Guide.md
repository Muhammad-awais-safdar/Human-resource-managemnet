# 23 — Component Scaffolding Rules & Folder Architecture Guide

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Frontend Engineers, Component Authors, Developer Tooling Leads
- **Design System Cross-Reference**: `docs/ui-ux/38_Component_Development_Guide.md`

---

## 1. Purpose

This document provides developer instructions and scaffolding standards for creating new React components in **Awais HR**.

---

## 2. Scope

This specification governs component file organization, internal file layout order, export patterns, unit test file placement, and Storybook/documentation contracts.

---

## 3. Standards & Internal Component File Layout Order

Every React component file must adhere to the standardized line ordering below:
1. React & Framework Imports (`react`, `next/navigation`).
2. Third-Party Library Imports (`lucide-react`, `framer-motion`).
3. Internal Project Imports (`@/components/...`, `@/utils/...`).
4. Type / Interface Definitions (`export interface ComponentProps`).
5. Main Component Declaration (`export const ComponentName = ...`).
6. DisplayName Declaration (`ComponentName.displayName = ...`).

---

## 4. Component Directory Structure Standard

```
src/components/primitives/Button/
├── Button.tsx                      # Main React Component File
├── Button.test.tsx                 # Vitest Unit Test File
├── Button.module.css               # Optional Modular Styles (if required)
└── index.ts                        # Clean Public Barrel Export
```

---

## 5. Naming Conventions

- **Component Directories**: PascalCase matching main component (e.g. `src/components/primitives/Button/`).
- **Barrel Exports**: `index.ts` exporting default or named components.

---

## 6. Implementation Code Contracts

```typescript
// Standard Component Barrel Export Contract (src/components/primitives/Button/index.ts)
export * from './Button';
```

---

## 7. Best Practices

- **Keep Components Small**: Limit individual component files to under 200 lines of code; decompose complex UI logic into sub-components.
- **Export Named Components**: Avoid default exports (`export default`) for primitive components to improve IDE auto-import accuracy.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** colocate unit tests (`Button.test.tsx`) inside the component's folder.
- **DO** define explicit TypeScript props interfaces for every exported component.

### Don'ts
- **DON'T** create circular dependencies between component folders.
- **DON'T** mix domain-specific business API calls inside primitive UI components.

---

## 9. Dependencies Reference

- `vitest`: Unit test framework
- `@testing-library/react`: React component rendering test suite

---

## 10. Implementation Notes

A custom npm CLI script (`npm run generate-component Button`) automatically generates the standardized component directory, template code, type interfaces, and test files.
