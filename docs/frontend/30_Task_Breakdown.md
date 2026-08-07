# 30 — Frontend Implementation Task Matrix & Engineering Sprint Plan

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Engineering Leads, Scrum Masters, Frontend Developers
- **Design System Cross-Reference**: `docs/ui-ux/41_Frontend_Task_Breakdown.md`

---

## 1. Purpose

This document provides a granular task breakdown matrix for engineers implementing the frontend codebase of **Awais HR**.

---

## 2. Scope

This specification governs sprint task allocation, estimated engineering effort, task outputs, and acceptance criteria across 4 two-week development sprints.

---

## 3. Standards & Task Matrix

### 3.1 Sprint Task Breakdown Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND IMPLEMENTATION TASK MATRIX                                    │
├──────────┬──────────┬──────────────────────────────────────────────────┤
│ SPRINT   │ TASK ID  │ ACTIONABLE ENGINEERING TASK                      │
├──────────┼──────────┼──────────────────────────────────────────────────┤
│ Sprint 1 │ FE-101   │ Refactor `src/styles/variables.css` HSL Tokens   │
│          │ FE-102   │ Build `AppShellLayout.tsx`, Navbar & Sidebar     │
│          │ FE-103   │ Implement `CommandPaletteModal.tsx` (`cmdk`)     │
│          │ FE-104   │ Build `Button.tsx`, `Input.tsx`, `Badge.tsx`     │
├──────────┼──────────┼──────────────────────────────────────────────────┤
│ Sprint 2 │ FE-201   │ Construct `DataTable.tsx` TanStack Table Wrapper │
│          │ FE-202   │ Implement `Dialog.tsx`, `Sheet.tsx` Overlays     │
│          │ FE-203   │ Build `EmployeeDirectoryView.tsx` & Inspector    │
│          │ FE-204   │ Build `AttendanceRosterView.tsx` & Clock-In Widget│
├──────────┼──────────┼──────────────────────────────────────────────────┤
│ Sprint 3 │ FE-301   │ Implement `PayrollWizardForm.tsx` & Payslip PDF  │
│          │ FE-302   │ Build `ATSManagerKanban.tsx` & Resume Viewer     │
│          │ FE-303   │ Implement `FileDropzone.tsx` & S3 Uploader Hook  │
│          │ FE-304   │ Build `LeaveManagerView.tsx` & Balance Gauges    │
├──────────┼──────────┼──────────────────────────────────────────────────┤
│ Sprint 4 │ FE-401   │ Construct `RechartsAnalyticsView.tsx` Reports    │
│          │ FE-402   │ Implement `AICopilotDrawer.tsx` Streaming Panel  │
│          │ FE-403   │ Implement `SuperAdminConsoleView.tsx`            │
│          │ FE-404   │ Conduct E2E Playwright Audits & Performance Audit│
└──────────┴──────────┴──────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & Task Tracking

```
docs/frontend/
├── 30_Task_Breakdown.md            # Master Frontend Task Matrix
└── README.md                       # Master Frontend Handbook Index
```

---

## 5. Naming Conventions

- **Task IDs**: `FE-[Sprint][Number]` (e.g. `FE-101`, `FE-203`).

---

## 6. Implementation Code Contracts

```markdown
### Task FE-101 Verification Contract
- [ ] Refactor `src/styles/variables.css` to define 3-tier HSL CSS design tokens.
- [ ] Verify light/dark theme toggle updates CSS variables dynamically.
- [ ] Confirm WCAG AA contrast ratio compliance (>= 4.5:1).
```

---

## 7. Best Practices

- **Check Off Tasks Incrementally**: Update implementation progress in `task.md` as tasks are completed and merged.
- **Maintain Unit Test Coverage**: Ensure each completed task includes corresponding Vitest unit tests before closing tickets.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** verify that pull requests reference their specific task ID (e.g., `feat(FE-201): implement TanStack Table wrapper`).
- **DO** run full build checks (`npm run build`) before opening pull requests.

### Don'ts
- **DON'T** merge pull requests that break existing component unit tests.
- **DON'T** introduce ad-hoc third-party packages without prior architectural review.

---

## 9. Dependencies Reference

- `docs/ui-ux/41_Frontend_Task_Breakdown.md`

---

## 10. Implementation Notes

The completion of Task FE-404 marks the final production-ready frontend milestone for the Awais HR SaaS application platform.
