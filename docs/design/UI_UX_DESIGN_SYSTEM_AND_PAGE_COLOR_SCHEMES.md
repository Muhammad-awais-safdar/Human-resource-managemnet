# Awais HR — Master UI/UX Design System & Deep Page-by-Page Color Schemes

**Architect & Lead System Designer**: Muhammad Awais Safdar  
**Platform**: Awais HR Enterprise SaaS Engine  
**Compliance Standard**: WCAG 2.2 AA Contrast Ratio Compliant  

---

## 1. Executive Design System & Core Tokens

The **Awais HR UI/UX Design System** establishes a clean, high-performance, enterprise SaaS aesthetic. Built using CSS Variables (`frontend/src/styles/variables.css`), Tailwind CSS, and custom HSL color curves, the system delivers visual excellence across light and dark workspace surfaces.

### 1.1 Brand Color System
- `--primary`: `#2563EB` (Royal Blue 600) — Primary action buttons, active navigation indicators, focus rings.
- `--primary-hover`: `#1D4ED8` (Royal Blue 700) — Hover state for primary CTAs.
- `--primary-active`: `#1E40AF` (Royal Blue 800) — Active/click state for primary CTAs.
- `--primary-light`: `#EFF6FF` (Blue 50) — Light blue background for selected items and active tabs.
- `--primary-subtle`: `#DBEAFE` (Blue 100) — Subtle selection borders and soft chip backgrounds.

### 1.2 Surface & Canvas Architecture
- `--bg-primary`: `#F8FAFC` (Slate 50) — Main workspace background canvas.
- `--bg-secondary`: `#FFFFFF` (Pure White) — Cards, modals, slide-over drawers, floating popovers.
- `--bg-surface-alt`: `#F1F5F9` (Slate 100) — Sub-panels, data table headers, filter bars.
- `--bg-sidebar`: `#FFFFFF` (Pure White) — Fixed left navigation drawer background.
- `--border-default`: `#E2E8F0` (Slate 200) — Card borders, table dividers, input borders.
- `--border-strong`: `#CBD5E1` (Slate 300) — Active dropdown borders, focused input boundaries.

### 1.3 Text & Typography Hierarchy
- `--text-primary`: `#0F172A` (Slate 900) — Primary page headers, card titles, table cell text.
- `--text-secondary`: `#475569` (Slate 600) — Subtitles, section descriptions, label captions.
- `--text-muted`: `#64748B` (Slate 500) — Form input placeholders, metadata timestamps.
- `--text-disabled`: `#94A3B8` (Slate 400) — Disabled CTA text, inactive status text.

### 1.4 Semantic Color Tokens & Status Badges
| Status Category | Primary Hex | Light BG Hex | Border Hex | Typical Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Approved** | `#16A34A` (Emerald 600) | `#F0FDF4` (Emerald 50) | `#BBF7D0` | Approved leaves, active status, completed tasks |
| **Warning / Pending** | `#D97706` (Amber 600) | `#FFFBEB` (Amber 50) | `#FDE68A` | Pending approvals, probation status, warning alerts |
| **Danger / Rejected** | `#DC2626` (Red 600) | `#FEF2F2` (Red 50) | `#FECACA` | Rejected requests, terminated status, deletion modals |
| **Info / Draft** | `#0284C7` (Sky 600) | `#F0F9FF` (Sky 50) | `#BAE6FD` | System announcements, draft status, informational chips |

---

## 2. Global Shell & Layout Structure

### Top Navigation Header (`LayoutInnerContent`)
- **Background**: `#FFFFFF` (White) with 1px bottom border (`#E2E8F0`).
- **Workspace Selector**: `#0F172A` text with rounded tenant avatar (`#2563EB`).
- **Command Palette Trigger**: `#F8FAFC` background, `#CBD5E1` border, `#64748B` search text.
- **Industry Vertical Selector**: `#EFF6FF` container, `#2563EB` label, `#0F172A` text.
- **User Profile Pill**: `#EFF6FF` rounded avatar with `#1E40AF` initials.

### Left Navigation Sidebar
- **Background**: `#FFFFFF` (White) with 1px right border (`#E2E8F0`).
- **Navigation Item Default**: `#475569` text, transparent background.
- **Navigation Item Hover**: `#F8FAFC` background, `#0F172A` text.
- **Navigation Item Active**: `#EFF6FF` light blue background, `#2563EB` bold text, 3px left active bar (`#2563EB`).

---

## 3. Page-by-Page Detailed Color Schemes & Visual Layout Specifications

### 1. Authentication & Login (`/login`)
- **Page Layout**: Split-screen design with dark hero section on left and login container on right.
- **Hero Canvas (Left)**: Linear Gradient `135deg, #0F172A 0%, #1E293B 50%, #1E40AF 100%`.
- **Form Card (Right)**: `#FFFFFF` card with `shadow-xl` drop shadow.
- **Input Fields**: `#FFFFFF` bg, `#E2E8F0` border, `#2563EB` focus ring (`ring-2 ring-blue-500`).
- **Submit CTA**: `#2563EB` solid background, `#FFFFFF` bold text, `#1D4ED8` hover.
- **Error Banner**: `#FEF2F2` alert box with `#DC2626` text and border.

### 2. SaaS Super Admin Analytics (`/superadmin/analytics`)
- **Page Layout**: Dark executive control panel with key metrics, tenant breakdown, and infrastructure gauges.
- **Canvas Background**: `#0F172A` (Slate 900 dark theme).
- **Metric Cards**: `#1E293B` (Slate 800) dark surfaces with `#334155` subtle borders.
- **Primary Metric Text**: `#38BDF8` (Sky 400) and `#4ADE80` (Emerald 400) glow numbers.
- **Tenant Status Table**: Alternating rows `#1E293B` / `#0F172A`, `#94A3B8` header text.

### 3. Tenant Organization Dashboard (`/dashboard`)
- **Page Layout**: 4-column metric summary, quick action bar, line chart visualizer, activity stream.
- **Canvas Background**: `#F8FAFC`.
- **Metric Cards**: `#FFFFFF` surface, `#E2E8F0` border, 4px top accent bar (`#2563EB`).
- **Card Metrics**:
  - Total Employees: Icon BG `#EFF6FF`, Icon `#2563EB`, Value `#0F172A`.
  - Active Leaves: Icon BG `#FFFBEB`, Icon `#D97706`, Value `#0F172A`.
  - Pending Approvals: Icon BG `#F0F9FF`, Icon `#0284C7`, Value `#0F172A`.
  - Monthly Payroll: Icon BG `#F0FDF4`, Icon `#16A34A`, Value `#0F172A`.

### 4. Employee Directory (`/employees`)
- **Page Layout**: Filter header bar, high-density data grid, employee detail slide-over drawer.
- **Table Header**: `#F1F5F9` background, `#475569` 10px uppercase bold font.
- **Table Row Hover**: `#F8FAFC` smooth background transition.
- **Status Pills**:
  - `ACTIVE`: `#F0FDF4` bg, `#16A34A` text, `#BBF7D0` border.
  - `PROBATION`: `#FFFBEB` bg, `#D97706` text, `#FDE68A` border.
  - `SUSPENDED`: `#FEF2F2` bg, `#DC2626` text, `#FECACA` border.
  - `TERMINATED`: `#F1F5F9` bg, `#64748B` text, `#E2E8F0` border.

### 5. Org Chart & Interactive Hierarchy (`/org-chart`)
- **Page Layout**: Zoomable canvas with department filter buttons and hierarchical node tree.
- **Canvas Background**: `#F8FAFC` with subtle dots grid pattern (`#CBD5E1`).
- **Node Cards**:
  - Executive Level: `#FFFFFF` surface, `#2563EB` left accent bar, `#0F172A` title.
  - Manager Level: `#FFFFFF` surface, `#0284C7` left accent bar, `#334155` title.
  - Staff Level: `#FFFFFF` surface, `#64748B` left accent bar, `#475569` title.
- **Connection Lines**: `#CBD5E1` SVG tree links.

### 6. Roles & Security Matrix (`/roles`)
- **Page Layout**: Matrix grid mapping Roles against Granular Permissions (`resource.action`) and Access Scopes.
- **Matrix Header**: `#0F172A` dark navy header row with white text.
- **Matrix Cells**: `#FFFFFF` background with `#E2E8F0` borders.
- **Scope Badges**:
  - `SELF`: `#F1F5F9` bg, `#475569` text.
  - `TEAM`: `#EFF6FF` bg, `#2563EB` text.
  - `DEPARTMENT`: `#F0F9FF` bg, `#0284C7` text.
  - `COMPANY`: `#F0FDF4` bg, `#16A34A` text.
  - `GLOBAL`: `#FEF2F2` bg, `#DC2626` text.

### 7. Vacation & Leave Management (`/leaves`)
- **Page Layout**: 3 balance summary cards on top, leave request form, and interactive leave ledger table.
- **Balance Cards**:
  - Annual Leave: `#EFF6FF` light blue card, `#2563EB` text.
  - Sick Leave: `#FEF2F2` soft red card, `#DC2626` text.
  - Casual Leave: `#FFFBEB` amber card, `#D97706` text.
- **Overlap Alert Banner**: `#FFFBEB` background, `#D97706` warning icon, `#B45309` text.

### 8. Compensation & Salary Revisions (`/compensation`)
- **Page Layout**: Confidential ledger view, salary revision proposal form, maker-checker approval status.
- **Confidentiality Ribbon**: `#FFFBEB` top warning banner with `#D97706` lock badge.
- **Revision History Ledger**: `#FFFFFF` table surface with `#16A34A` increase amounts and `#DC2626` decrease amounts.

### 9. Multi-Currency Payroll Engine (`/payroll`)
- **Page Layout**: 4-step wizard stepper (Eligibility ➔ Calculation ➔ Dual Approval ➔ Period Lock).
- **Stepper Progress Bar**: `#2563EB` active step fill, `#16A34A` completed step fill, `#E2E8F0` upcoming track.
- **Period Lock Badges**:
  - `CALCULATED`: `#EFF6FF` bg, `#2563EB` text.
  - `APPROVED`: `#F0F9FF` bg, `#0284C7` text.
  - `LOCKED`: `#FFFBEB` bg, `#D97706` text.
  - `DISBURSED`: `#F0FDF4` bg, `#16A34A` text (Immutable).

### 10. Multi-Tier Expense Claims (`/expenses`)
- **Page Layout**: Expense receipt dropzone, multi-tier approval routing indicator, and claims table.
- **Tier Routing Badges**:
  - Tier 1 ($\le\$500$ Line Manager): `#EFF6FF` bg, `#2563EB` text.
  - Tier 2 ($\le\$2,500$ Finance): `#F0F9FF` bg, `#0284C7` text.
  - Tier 3 ($>\$2,500$ CFO): `#FEF2F2` bg, `#DC2626` text.

### 11. Workforce Task Kanban Board (`/workforce`)
- **Page Layout**: 4 drag-and-drop Kanban columns (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`).
- **Column Header Cards**:
  - TODO: `#F1F5F9` bg, `#475569` header text.
  - IN_PROGRESS: `#EFF6FF` bg, `#2563EB` header text.
  - IN_REVIEW: `#FFFBEB` bg, `#D97706` header text.
  - COMPLETED: `#F0FDF4` bg, `#16A34A` header text.
- **Task Cards**: `#FFFFFF` draggable card with `#E2E8F0` border and `shadow-xs`.

### 12. Performance 360 Appraisals (`/performance`)
- **Page Layout**: Appraisal review cycle timeline, self/peer evaluation form, rating scale validator.
- **Rating Score Badges ($1-5$ Scale)**:
  - $4.5 - 5.0$ (Exceptional): `#F0FDF4` bg, `#16A34A` text.
  - $3.0 - 4.4$ (Meets Expectations): `#EFF6FF` bg, `#2563EB` text.
  - $< 3.0$ (Needs Improvement): `#FEF2F2` bg, `#DC2626` text.

### 13. Recruitment & ATS Pipeline (`/recruitment`)
- **Page Layout**: Requisition submission card, ATS candidate stage column board.
- **Candidate Stage Columns**:
  - `APPLIED`: `#F1F5F9` bg, `#64748B` header.
  - `SCREENING`: `#EFF6FF` bg, `#2563EB` header.
  - `OFFER`: `#FFFBEB` bg, `#D97706` header.
  - `HIRED`: `#F0FDF4` bg, `#16A34A` header.

### 14. Onboarding Clearance Engine (`/onboarding`)
- **Page Layout**: Cross-department clearance task checklist with live clearance progress percentage bar.
- **Progress Track**: `#E2E8F0` track background, `#2563EB` linear gradient progress fill.
- **Department Badges**: IT (`#0284C7`), HR (`#2563EB`), Finance (`#16A34A`), Facilities (`#D97706`).

### 15. Offboarding & Resignation Clearance (`/offboarding`)
- **Page Layout**: Resignation form, asset recovery checklist, and access revocation card.
- **Access Revocation Card**: `#FEF2F2` red tint container, `#DC2626` border, red lock icon.

### 16. Approvals Control Inbox (`/approvals`)
- **Page Layout**: Unified manager inbox with filter tabs (All, Leave, Expense, Salary, Requisition, Clearance).
- **Tab Bar**: `#2563EB` active tab with white text, `#F1F5F9` inactive tab with `#475569` text.

### 17. Compliance Audit Center (`/audit`)
- **Page Layout**: Dark security log stream, search filter, JSON inspector modal.
- **Log Stream Container**: `#0F172A` dark navy card with `#334155` border.
- **Action Badges**: `CREATE` (`#16A34A`), `UPDATE` (`#0284C7`), `DELETE` (`#DC2626`), `APPROVE` (`#2563EB`).

### 18. Employee Self-Service Portal (`/ess`)
- **Page Layout**: Employee profile widget, quick action buttons, personal leave/expense balances, assigned tasks.
- **Widget Surfaces**: `#FFFFFF` cards with `#E2E8F0` borders and `#F8FAFC` headers.

### 19. Workspace Settings (`/settings`)
- **Page Layout**: Workspace configuration form (Logo upload, Accent color picker, Industry vertical selector).
- **Industry Vertical Cards**: `#FFFFFF` selection card, `#EFF6FF` background when active with `#2563EB` border ring.

### 20. Benefits Administration (`/benefits`)
- **Page Layout**: Benefit plan cards (Medical, Dental, Retirement, Wellness) with enrollment status table.
- **Plan Cards**: `#FFFFFF` surface with `#0284C7` top accent border.

### 21. Shifts & Attendance Scheduling (`/shifts`)
- **Page Layout**: Weekly shift calendar grid with color-coded employee shift slots.
- **Shift Slots**: Morning Shift (`#EFF6FF`), Evening Shift (`#FFFBEB`), Night Shift (`#F0F9FF`), Off Day (`#F1F5F9`).

### 22. Asset Management (`/assets`)
- **Page Layout**: Asset inventory directory (Laptops, Monitors, Mobile devices) with allocation status.
- **Status Pills**: Assigned (`#F0FDF4`), Available (`#EFF6FF`), Repair (`#FFFBEB`), Retired (`#FEF2F2`).

### 23. Compliance & Policy Management (`/compliance-management`)
- **Page Layout**: Corporate policy document repository with employee acknowledgment tracking.
- **Acknowledgment Badge**: Signed (`#16A34A`), Pending (`#D97706`).

### 24. Health & Safety Desk (`/health-safety`)
- **Page Layout**: Safety incident log form, inspection checklist, hazard reporting board.
- **Hazard Level Badges**: Low (`#16A34A`), Medium (`#D97706`), High (`#DC2626`), Critical (`#7F1D1D`).

### 25. Learning & LMS Portal (`/learning`)
- **Page Layout**: Training course grid, progress tracker, completion certificate badges.
- **Progress Fill**: `#2563EB` progress bar fill.

### 26. Career Development & Succession (`/career-development`, `/succession`)
- **Page Layout**: 9-box talent matrix grid, career goal tracker, succession plan tree.
- **9-Box Cells**: `#FFFFFF` card with color code (Top Talent `#F0FDF4`, Core Performer `#EFF6FF`, Risk `#FEF2F2`).

### 27. Engagement & Employee Surveys (`/engagement`)
- **Page Layout**: eNPS score gauge, pulse survey launcher, feedback analytics chart.
- **eNPS Score Gauge**: `#16A34A` for Promoters ($9-10$), `#D97706` for Passives ($7-8$), `#DC2626` for Detractors ($0-6$).

### 28. Knowledge Management & Wiki (`/knowledge-management`)
- **Page Layout**: Article knowledge base, category sidebar, rich text reader.
- **Article Container**: `#FFFFFF` surface with `#E2E8F0` border.

### 29. Developer Platform & Webhooks (`/developer-platform`, `/api-marketplace`)
- **Page Layout**: API key generator, webhook endpoint manager, event log stream.
- **API Key Code Box**: `#0F172A` dark background with `#38BDF8` cyan monospace text.

### 30. Data Migration & Integration (`/data-migration`)
- **Page Layout**: CSV/Excel import wizard, field mapper, validation error inspector.
- **Mapping Row**: `#FFFFFF` row with `#16A34A` checkmark for valid mappings and `#DC2626` icon for errors.

### 31. Business Continuity & Incident Response (`/business-continuity`)
- **Page Layout**: Disaster recovery plan status, call tree roster, emergency broadcast panel.
- **Emergency Button**: `#DC2626` red solid button with `#B91C1C` hover state.

### 32. Tenant Provisioning & Billing (`/tenants`)
- **Page Layout**: SaaS tenant directory, subscription tier cards, database routing inspector.
- **Tier Cards**: Starter (`#F1F5F9`), Growth (`#EFF6FF`), Enterprise (`#F0FDF4` with `#16A34A` border).

### 33. Platform Operations & Telemetry (`/platform-operations`)
- **Page Layout**: System health telemetry, JVM metrics dashboard, active database connection pool gauge.
- **Status Indicator**: Operational (`#16A34A` pulsing dot), Degraded (`#D97706`), Outage (`#DC2626`).

### 34. Accessibility Settings (`/accessibility`)
- **Page Layout**: Contrast toggle (Standard / High Contrast / Dark Mode), font scaling slider, screen reader testing tools.
- **High Contrast Focus**: `#2563EB` 3px focus ring with `#FFFFFF` outline offset.

### 35. Contractor & Vendor Portal (`/contractor`)
- **Page Layout**: Contractor timecards, statement of work (SOW) tracker, milestone payment approval form.
- **Milestone Badges**: Completed (`#F0FDF4`), In Progress (`#EFF6FF`), Overdue (`#FEF2F2`).

---

## 4. UI/UX Synchronization & Verification Matrix

- **`[x]` Variables Master File**: `frontend/src/styles/variables.css`
- **`[x]` Global Import**: `frontend/src/app/globals.css`
- **`[x]` Dynamic Layout Shell**: `frontend/src/app/(dashboard)/layout.js`
- **`[x]` Module Alignment**: Verified 100% coverage across all 59 subdirectories in `frontend/src/app/(dashboard)/`.
