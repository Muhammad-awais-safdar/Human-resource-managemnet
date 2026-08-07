# Awais HR — Master Frontend Engineering Implementation Handbook

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Frontend Engineers, Lead Architects, Technical Program Managers, QA Engineers
- **Design System Cross-Reference**: `docs/ui-ux/README.md` (46 Specification Documents)

---

## 1. Purpose

This handbook serves as the definitive frontend architecture, technical contract, and implementation standard for **Awais HR**. It dictates how frontend engineers construct, test, optimize, and maintain the Next.js 16 web application on the `revampp-ui` branch.

All design requirements are derived strictly from `docs/ui-ux/`. This handbook governs the technical execution of those designs using Next.js 16, React 19, TypeScript, Tailwind CSS v4, Radix UI, TanStack Query v5, TanStack Table v8, React Hook Form, Zod, Framer Motion, and Zustand.

---

## 2. Scope

This specification suite applies to all customer-facing and internal web interfaces within Awais HR:
- Multi-Tenant Employee Self-Service (ESS) & Manager Self-Service (MSS) Portals.
- Enterprise Core HR, Attendance, Leave, Payroll, ATS, Performance, LMS, Assets, Help Desk, Analytics, and Notification Systems.
- Internal SaaS SuperAdmin & Plan Subscription Management Console.

---

## 3. Technology Stack & Architectural Standards

| Architectural Layer | Production Technology Choice | Version Standard | Architectural Role |
| :--- | :--- | :--- | :--- |
| **Core Framework** | Next.js (App Router) | `v16.x` | Hybrid Server/Client Component Architecture |
| **UI Engine** | React | `v19.x` | View Layer & Concurrent Rendering Primitives |
| **Language** | TypeScript | `v5.x` | Strict Type Safety & DTO Integration |
| **Styling Engine** | Tailwind CSS / CSS Variables | `v4.x` | 3-Tier Design Token & HSL Theming |
| **Accessibility Base**| Radix UI / shadcn/ui | Latest | Headless WAI-ARIA Primitive Wrappers |
| **Server State** | TanStack Query | `v5.x` | Async Caching, Revalidation & Optimistic Updates |
| **Data Tables** | TanStack Table | `v8.x` | Virtualized Enterprise Table Engine |
| **Forms & Validation**| React Hook Form + Zod | Latest | Type-Safe Validation & Wizard Draft Sync |
| **Client State** | Zustand | `v4.x` | Global UI Preferences & App Shell State |
| **Animation Engine** | Framer Motion + GSAP | Latest | Physics-Based Spring Animations & Gestures |
| **Iconography** | Lucide React | Latest | Standardized SVG Vector Icons |

---

## 4. Master Handbook Document Index

Below is the complete catalog of the 31 engineering specification documents contained within `docs/frontend/`:

| Document | Title & Primary Architectural Focus |
| :--- | :--- |
| [`README.md`](./README.md) | Master Handbook Overview & Tech Stack Specifications |
| [`01_Project_Structure.md`](./01_Project_Structure.md) | Modular Directory Taxonomy & Feature Encapsulation Rules |
| [`02_Routing_Strategy.md`](./02_Routing_Strategy.md) | Next.js 16 App Router Routes, Deep Linking & Middleware Guards |
| [`03_Layout_Architecture.md`](./03_Layout_Architecture.md) | Multi-Pane App Shell, Sidebar Rails & Inspector Drawers |
| [`04_Component_Architecture.md`](./04_Component_Architecture.md) | Atomic Component Hierarchy, Radix Wrappers & Variant Contracts |
| [`05_State_Management.md`](./05_State_Management.md) | Zustand Client Stores vs. TanStack Query Server Caching |
| [`06_API_Integration.md`](./06_API_Integration.md) | Axios Interceptors, JWT Token Refresh & Multi-Tenant Headers |
| [`07_Authentication_Flow.md`](./07_Authentication_Flow.md) | Session Lifecycle, Login 2FA & Server Middleware Guards |
| [`08_Authorization_RBAC_UI.md`](./08_Authorization_RBAC_UI.md) | Role-Based UI Element Masking & Permission Hooks |
| [`09_Data_Table_Architecture.md`](./09_Data_Table_Architecture.md) | TanStack Table v8, Virtualization & Floating Batch Bars |
| [`10_Form_Architecture.md`](./10_Form_Architecture.md) | React Hook Form, Zod Validation Schemas & Multi-Step Wizards |
| [`11_File_Upload_Architecture.md`](./11_File_Upload_Architecture.md) | Drag-and-Drop Uploader, Chunking & S3/Presigned URLs |
| [`12_Charts_Architecture.md`](./12_Charts_Architecture.md) | Recharts Visual Engine, Dynamic Tooltips & Export Pipeline |
| [`13_Search_Filter_Architecture.md`](./13_Search_Filter_Architecture.md) | Debounced Search, URL Query Params & Dynamic Filter Bar |
| [`14_Command_Palette.md`](./14_Command_Palette.md) | `cmdk` Global Search, Keyboard Shortcuts & Action Triggers |
| [`15_Theme_System.md`](./15_Theme_System.md) | Tailwind v4 HSL Theme Engine & Dynamic Multi-Tenant White-Labeling |
| [`16_Notification_System.md`](./16_Notification_System.md) | WebSocket Alerts, Notification Center Drawer & Toast System |
| [`17_Error_Handling.md`](./17_Error_Handling.md) | React Error Boundaries, Fallback UI & API Exception Mapping |
| [`18_Loading_Strategies.md`](./18_Loading_Strategies.md) | Suspense Boundaries, Skeleton Loaders & Optimistic Feedback |
| [`19_Caching_Strategy.md`](./19_Caching_Strategy.md) | TanStack Query Cache Invalidation & Stale-While-Revalidate |
| [`20_Responsive_Implementation.md`](./20_Responsive_Implementation.md) | Viewport Breakpoints & Touch-Friendly Bottom Sheet Drawers |
| [`21_Accessibility_Implementation.md`](./21_Accessibility_Implementation.md) | WCAG 2.1 AA+ Compliance, ARIA Live Regions & Focus Rings |
| [`22_Animation_Implementation.md`](./22_Animation_Implementation.md) | Framer Motion Springs & GSAP Physics Parameters |
| [`23_Component_Folder_Guide.md`](./23_Component_Folder_Guide.md) | Scaffolding Rules & Directory Patterns for Components |
| [`24_Hooks_Guide.md`](./24_Hooks_Guide.md) | Custom Hooks Directory (`useTenant`, `useHotkeys`, `useTable`) |
| [`25_Utilities_Guide.md`](./25_Utilities_Guide.md) | Utility Functions (`cn`, `currency`, `date`, `formatters`) |
| [`26_Testing_Strategy.md`](./26_Testing_Strategy.md) | Vitest Unit Testing, RTL & Playwright E2E Test Suite |
| [`27_Performance_Guide.md`](./27_Performance_Guide.md) | Bundle Optimization, Code Splitting & CLS=0 Auditing |
| [`28_Coding_Standards.md`](./28_Coding_Standards.md) | Strict TypeScript, ESLint Rules & Stylelint Enforcement |
| [`29_Screen_Implementation_Order.md`](./29_Screen_Implementation_Order.md) | Viewport & Screen Execution Hierarchy |
| [`30_Task_Breakdown.md`](./30_Task_Breakdown.md) | Complete Frontend Task Implementation Matrix |

---

## 5. Folder Structure Standard

The frontend application code must strictly follow the root encapsulation pattern below:

```
frontend/
├── src/
│   ├── app/                        # Next.js 16 App Router Routes
│   │   ├── (auth)/                 # Unauthenticated Routes (Login, 2FA)
│   │   ├── (dashboard)/            # Authenticated App Shell Routes
│   │   ├── layout.tsx              # Root Layout Container
│   │   └── page.tsx                # Gateway Landing Route
│   ├── components/                 # Shared UI Components
│   │   ├── primitives/             # Atomic Elements (Buttons, Inputs, Badges)
│   │   ├── overlay/                # Modals, Drawers, Tooltips, Toasts
│   │   ├── shell/                  # App Shell Header, Navigation, Command Palette
│   │   └── data-display/           # Data Tables, Charts, Stat Cards
│   ├── modules/                    # Feature Encapsulated Modules
│   │   ├── employee/               # Directory, Org Chart, Onboarding
│   │   ├── payroll/                # Payroll Wizard & Payslips
│   │   ├── attendance/             # Geofence Clock-In & Shifts
│   │   └── ats/                    # Recruitment Kanban Pipeline
│   ├── hooks/                      # Custom React Hooks
│   ├── store/                      # Zustand Client Stores
│   ├── services/                   # Axios API Clients & DTO Adapters
│   ├── styles/                     # CSS Variables & Tailwind Tokens
│   ├── types/                      # Global TypeScript Type Definitions
│   └── utils/                      # Pure Helper Utility Functions
└── docs/                           # Documentation Directory
    ├── ui-ux/                      # UI/UX Design System Specs (46 files)
    └── frontend/                   # Frontend Implementation Handbook (31 files)
```

---

## 6. Naming Conventions

- **Directories**: kebab-case (e.g., `data-display/`, `employee-directory/`).
- **React Components**: PascalCase (e.g., `EmployeeDataTable.tsx`, `PrimaryButton.tsx`).
- **Hooks**: camelCase starting with `use` (e.g., `useTenantContext.ts`, `useHotkeys.ts`).
- **Zustand Stores**: camelCase starting with `use` and ending in `Store` (e.g., `useUserPreferencesStore.ts`).
- **Utility Files**: camelCase (e.g., `formatCurrency.ts`, `cn.ts`).
- **TypeScript Interfaces/Types**: PascalCase prefixed with `I` for interfaces or descriptive names for types (e.g., `IEmployeeDto`, `TenantId`).

---

## 7. Architectural Code Contract Examples

```typescript
// Standard Component & Type Definition Architecture Contract
import React from 'react';
import { cn } from '@/utils/cn';

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] disabled:opacity-50 select-none',
          className
        )}
        {...props}
      >
        {isLoading ? <span className="animate-spin mr-2">🌀</span> : null}
        {children}
      </button>
    );
  }
);
PrimaryButton.displayName = 'PrimaryButton';
```

---

## 8. Best Practices Summary

- **Single Source of Truth**: All UI dimensions, colors, and behaviors must derive directly from `docs/ui-ux/` specifications.
- **Strict Zero-Inline-Styles Rule**: Never use `style={{ ... }}` in JSX files. All styling must utilize Tailwind CSS v4 or CSS HSL design token variables.
- **Type Safety**: Enforce `strict: true` in `tsconfig.json`. No usage of `any`.
- **Accessibility by Default**: Ensure all interactive components pass screen-reader tests and possess keyboard focus indicators.

---

## 9. Core Engineering Do's & Don'ts

### Do's
- **DO** use Next.js Server Components for layout scaffolding and static data fetches.
- **DO** isolate client state mutations using TanStack Query custom hooks.
- **DO** memoize dense table cell renderers using `React.memo` and `useCallback`.
- **DO** enforce responsive touch targets (`min 44px`) for mobile viewports.

### Don'ts
- **DON'T** put raw HEX colors in code; always use semantic variables (`var(--accent-primary)`).
- **DON'T** mutate local component state when data belongs in URL query params.
- **DON'T** import client hooks inside Server Components without `'use client'`.
- **DON'T** disable ESLint or TypeScript strict rules to force builds to pass.

---

## 10. Core Dependencies Reference

- `next`: `^16.0.0`
- `react`: `^19.0.0`
- `react-dom`: `^19.0.0`
- `typescript`: `^5.4.0`
- `tailwindcss`: `^4.0.0`
- `@radix-ui/react-dialog`: `^1.0.5`
- `@radix-ui/react-dropdown-menu`: `^2.0.6`
- `@tanstack/react-query`: `^5.28.0`
- `@tanstack/react-table`: `^8.15.0`
- `react-hook-form`: `^7.51.0`
- `zod`: `^3.22.4`
- `zustand`: `^4.5.2`
- `framer-motion`: `^11.0.0`
- `lucide-react`: `^0.359.0`
- `axios`: `^1.6.8`

---

## 11. Implementation Notes

Frontend engineers must consult the relevant document inside `docs/frontend/` prior to starting work on any feature task. All pull requests will be audited against the coding standards and pre-release design QA checklists outlined in this handbook.
