# 29 — Screen Implementation Order & Execution Sequence Hierarchy

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Engineering Managers, Frontend Leads, Product Managers
- **Design System Cross-Reference**: `docs/ui-ux/41_Frontend_Task_Breakdown.md`

---

## 1. Purpose

This document dictates the screen implementation sequence for building the **Awais HR** frontend on the `revampp-ui` branch.

---

## 2. Scope

This specification governs phase dependency ordering, core screen execution priorities, and module rollout prerequisites.

---

## 3. Standards & Execution Sequence

### 3.1 4-Phase Screen Implementation Sequence Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ SCREEN IMPLEMENTATION SEQUENCE MATRIX                                  │
├─────────┬───────────────────────────────┬──────────────────────────────┤
│ PHASE   │ TARGET SCREENS & COMPONENTS   │ PREREQUISITE DEPENDENCIES    │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ Phase 1 │ Auth Cards, App Shell Layout, │ Design Tokens (`variables.css`)│
│         │ Top Header, Navigation Sidebar│ Base Primitive Components    │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ Phase 2 │ Employee Directory, Profile   │ TanStack Table Wrapper,      │
│         │ Inspector Drawer, Attendance  │ React Hook Form Engine       │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ Phase 3 │ Payroll Wizard, Leave Manager,│ Multi-Step Form Stepper,     │
│         │ ATS Recruitment Kanban Board  │ Drag-and-Drop Uploader       │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ Phase 4 │ Analytics BI, LMS Courses,    │ Recharts Engine,             │
│         │ SuperAdmin Console, AI Copilot│ WebSocket Listener Service   │
└─────────┴───────────────────────────────┴──────────────────────────────┘
```

---

## 4. Folder Structure & Screen Hierarchy

```
src/app/(dashboard)/
├── [Phase 1] layout.tsx             # Master App Shell Layout
├── [Phase 1] dashboard/page.tsx     # Executive Dashboard Canvas
├── [Phase 2] employees/page.tsx     # Employee Directory View
├── [Phase 2] attendance/page.tsx    # Attendance Shift Roster
├── [Phase 3] payroll/page.tsx       # Payroll Execution Wizard
├── [Phase 3] recruitment/page.tsx   # ATS Kanban Pipeline
└── [Phase 4] analytics/page.tsx     # BI Recharts Reports
```

---

## 5. Naming Conventions

- **Screen Views**: PascalCase ending in `View.tsx` (e.g. `EmployeeDirectoryView.tsx`).

---

## 6. Implementation Code Contracts

```typescript
// Screen Implementation Export Contract (src/modules/employee/index.ts)
export { EmployeeDirectoryView } from './components/EmployeeDirectoryView';
export { EmployeeProfileView } from './components/EmployeeProfileView';
```

---

## 7. Best Practices

- **Build Lower-Level Primitives First**: Never attempt to build complex screen views (e.g., Payroll Wizard) before the underlying primitives (Button, Input, Select, Stepper) are fully constructed and tested.
- **Verify Route Shell Transitions Early**: Ensure layout navigation and sidebar collapse mechanics operate smoothly in Phase 1.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** follow the phase execution sequence strictly to avoid blockages caused by missing primitive dependencies.
- **DO** validate each screen against pre-release Design QA checklists upon phase completion.

### Don'ts
- **DON'T** jump ahead to Phase 4 analytics views before Phase 1 App Shell infrastructure is fully stabilized.
- **DON'T** merge incomplete screen views into main branch builds without feature toggle guards.

---

## 9. Dependencies Reference

- `docs/ui-ux/41_Frontend_Task_Breakdown.md`: Master Design System Implementation Roadmap

---

## 10. Implementation Notes

Engineers must complete all test suites for a phase before advancing to the next phase in the implementation hierarchy.
