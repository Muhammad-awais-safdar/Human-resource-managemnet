# 15 — Employee Management & Org Structure UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Core HR Designers, Frontend Engineers, Module Architects
- **Cross-References**: `10_Layout_System.md`, `14_Table_Standards.md`, `15_Employee_Module_UI.md`

---

## 1. Purpose

This document specifies the UI/UX architecture for the Core HR & Employee Management Module. It defines specifications for the Employee Directory, 360 Profile View, Interactive Org Chart Visualizer, and Employee Onboarding Flow.

---

## 2. Executive Overview

The Employee Management module acts as the core central repository for workforce data. It provides fast search filtering, visual org chart navigation, multi-tab profile inspection, and streamlined wizard onboarding.

---

## 3. Detailed Specifications

### 3.1 Employee Directory Workspace Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ EMPLOYEE DIRECTORY WORKSPACE                                           │
├────────────────────────────────────────────────────────────────────────┤
│ [Search Employee Name, Email, Department...]  [Filter Dept] [Filter Status] │
├────────────────────────────────────────────────────────────────────────┤
│ [ List View ] [ Grid Cards View ] [ Org Chart View ]                   │
├────────────────────────────────────────────────────────────────────────┤
│ AVATAR │ NAME & ROLE          │ DEPARTMENT    │ STATUS    │ ACTIONS    │
│ 👤     │ Sarah Jenkins (Lead) │ Engineering   │ Active 🟢 │ [Inspect]  │
│ 👤     │ Michael Chang (Dev)  │ Product Design│ Active 🟢 │ [Inspect]  │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Interactive Org Chart Tree Visualizer
- **Rendering Engine**: React Flow / SVG Node Hierarchy Tree.
- **Node Geometry**: Compact cards displaying avatar, employee name, job title, department tag, and direct report counter (`+4 Reports`).
- **Interactive Controls**: Zoom in/out buttons, pan control, collapse/expand child nodes.

---

## 4. Design Decisions & Rationale

- **Multi-Tab Profile Inspector Drawer**: Clicking an employee opens a multi-tab right-side drawer containing:
  - **Overview**: Personal info, job title, contact.
  - **Employment & Compensation**: Salary band, manager hierarchy.
  - **Documents**: Contract PDF, ID uploads.
  - **Attendance & Time Off**: Leave balance summary.

---

## 5. Examples & Implementation Contracts

```jsx
// Employee Card Component Contract
export function EmployeeGridCard({ name, title, department, avatarUrl, status, onInspect }) {
  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col items-center text-center hover:border-[var(--border-strong)] transition-all">
      <img src={avatarUrl || '/default-avatar.png'} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-[var(--accent-primary)] mb-3" />
      <h4 className="font-bold text-sm text-[var(--text-primary)]">{name}</h4>
      <p className="text-xs text-[var(--text-secondary)]">{title}</p>
      <span className="mt-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[var(--bg-surface-l2)] text-[var(--text-muted)]">{department}</span>
      <button onClick={onInspect} className="mt-4 w-full py-1.5 text-xs font-semibold text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 rounded-lg hover:bg-[var(--accent-primary)]/10">
        View Profile
      </button>
    </div>
  );
}
```

---

## 6. Best Practices

- **Sanitize Profile Uploads**: Enforce square cropping and client-side image compression before uploading profile photos.
- **Protect Sensitive Data**: Mask national ID numbers and salary figures by default behind a click-to-reveal trigger.

---

## 7. Future Considerations

- **AI Career Path Visualizer**: Intelligent career progression mapper suggesting skill training programs based on org promotion history.
