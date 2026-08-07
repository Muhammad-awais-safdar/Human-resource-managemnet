# 01 — Project Structure & Modular Directory Architecture

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Frontend Architects, Senior React Engineers, Module Leads
- **Design System Cross-Reference**: `docs/ui-ux/34_Information_Architecture.md`, `docs/ui-ux/37_Frontend_Architecture.md`

---

## 1. Purpose

This document defines the Next.js 16 modular directory taxonomy for **Awais HR**. It establishes rules for code organization, feature-driven module encapsulation, component colocation, and strict architectural separation between global infrastructure, shared primitives, and domain-specific feature logic.

---

## 2. Scope

This architecture specification applies to all code residing inside the `frontend/src/` directory. It governs file placement for routes, components, hooks, stores, API services, types, and utility functions.

---

## 3. Standards & Architecture Guidelines

### 3.1 Modular Encapsulation Standard
Awais HR follows a **Domain-Driven Modular Architecture**. Code is structured primarily by business domain (e.g. `modules/payroll/`, `modules/employee/`) rather than flat technical categories. 

- **Domain Isolation**: Each module contains its own views, components, API hooks, and DTO adapters.
- **Shared Primitives Separation**: Generic UI primitives (Buttons, Inputs, Modals) reside in `components/`, while domain-specific widgets (PayslipDrawer, OrgChartNode) reside inside their respective module folders.

---

## 4. Folder Structure Taxonomy

```
frontend/src/
├── app/                            # Next.js 16 App Router Entry Points
│   ├── (auth)/                     # Auth Route Group
│   ├── (dashboard)/                # Main Dashboard App Shell Routes
│   │   ├── employees/              # /employees Route
│   │   ├── payroll/                # /payroll Route
│   │   └── layout.tsx              # Authenticated Layout Shell
│   ├── api/                        # Route Handlers / BFF Proxy
│   ├── globals.css                 # Global HSL CSS Tokens & Tailwind Imports
│   └── layout.tsx                  # Root HTML Container & Global Providers
├── components/                     # Shared UI Component Library
│   ├── primitives/                 # Atomic UI (Button, Input, Badge, Switch)
│   ├── overlay/                    # Modals, Drawers, Tooltips, Dialogs
│   ├── shell/                      # App Shell (Navbar, Sidebar, CommandPalette)
│   └── data-display/               # DataTable, StatWidget, ChartWrapper
├── modules/                        # Encapsulated Enterprise Modules
│   ├── employee/                   # Core HR Module
│   │   ├── components/             # Employee-specific widgets
│   │   ├── hooks/                  # useEmployeeData, useOrgChart
│   │   ├── services/               # Employee API endpoints
│   │   └── types/                  # Employee DTOs & Interfaces
│   ├── payroll/                    # Payroll Engine Module
│   ├── attendance/                 # Timekeeping Module
│   ├── ats/                        # Recruitment Module
│   └── performance/                # OKR & 9-Box Performance Module
├── hooks/                          # Shared Global React Hooks
├── store/                          # Zustand Client State Stores
├── services/                       # Axios Client & API Base Adapters
├── styles/                         # CSS Variables & Animation Tokens
├── types/                          # Global App-wide TypeScript Types
└── utils/                          # Pure Formatter & Utility Functions
```

---

## 5. Naming Conventions

- **Module Folders**: Lowercase kebab-case (e.g. `modules/employee-onboarding/`).
- **React Component Files**: PascalCase ending in `.tsx` (e.g., `EmployeeDirectoryTable.tsx`).
- **Component Test Files**: Matching component name with `.test.tsx` suffix colocated in `__tests__/`.
- **Custom Hooks**: camelCase starting with `use` ending in `.ts` (e.g., `usePayrollExecution.ts`).
- **Service Files**: camelCase ending in `Service.ts` (e.g., `attendanceService.ts`).
- **DTO Interfaces**: PascalCase ending in `Dto` (e.g., `CreateEmployeeRequestDto.ts`).

---

## 6. Implementation Code Contracts

```typescript
// Standard Module Export Contract (modules/employee/index.ts)
export * from './components/EmployeeDirectoryView';
export * from './components/EmployeeInspectorDrawer';
export * from './hooks/useEmployeeDirectory';
export * from './services/employeeService';
export * from './types/employeeTypes';
```

---

## 7. Best Practices

- **Colocate Module-Specific Components**: If a component is only used inside the Payroll module, store it in `modules/payroll/components/` rather than `src/components/`.
- **Keep `src/components/` Pure**: Only place generic, domain-agnostic UI elements (buttons, inputs, dropdowns) inside `src/components/primitives/`.
- **Export via Index Barrel Files**: Use clean index files (`index.ts`) in module roots to simplify imports.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** place page route handlers in `src/app/` and delegate actual UI rendering to module view components.
- **DO** maintain strict boundaries between domain modules; import cross-module components cleanly via index barrels.

### Don'ts
- **DON'T** create deeply nested folder structures beyond 4 levels deep.
- **DON'T** put domain-specific business logic inside `src/components/primitives/`.
- **DON'T** import private module files directly without using module public API exports.

---

## 9. Dependencies Reference

- `next`: App Router file-system routing conventions
- `typescript`: Path aliases configured in `tsconfig.json` (`@/*` pointing to `src/*`)

---

## 10. Implementation Notes

When introducing a new HR module (e.g. `Succession Planning`), engineers must create a dedicated directory inside `src/modules/succession/` containing `components/`, `hooks/`, `services/`, and `types/` subdirectories to preserve clean modular architecture.
