# 🚀 Awais HR — Next-Gen Enterprise Multi-Tenant SaaS HRMS Engine

[![Platform](https://img.shields.io/badge/Platform-Enterprise%20SaaS-blue.svg)](https://github.com/Muhammad-awais-safdar/Human-resource-managemnet)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith-emerald.svg)](docs/ENTERPRISE_WORKFLOW_ARCHITECTURE.md)
[![Backend](https://img.shields.io/badge/Backend-Java%2021%20%7C%20Spring%20Boot%203.3.1-orange.svg)](backend/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20React%2018-black.svg)](frontend/)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0%20(Database--per--Tenant)-blue.svg)](backend/src/main/resources/db/migration/tenant/core/)
[![Release Status](https://img.shields.io/badge/Release-v2.0.0%20RELEASE%20READY-brightgreen.svg)](docs/release/RELEASE_CANDIDATE_REPORT.md)

---

## 👨‍💻 Product Architect & Lead Developer

| Role / Title | Developer Name & Attribution | Contact / Profile |
| :--- | :--- | :--- |
| **Principal Software Architect & SaaS Product Owner** | **Muhammad Awais Safdar** | [GitHub Profile](https://github.com/Muhammad-awais-safdar) |
| **Lead DevOps & DevSecOps Engineer** | **Awais Enterprise Infrastructure Team** | `devops@awais-hr.com` |
| **Core Systems & Database Architect** | **Awais Backend Engineering Group** | `architecture@awais-hr.com` |

---

## 🌟 Product Executive Summary

**Awais HR** is a state-of-the-art, high-throughput, multi-tenant Enterprise SaaS Human Resource Management Platform designed by **Muhammad Awais Safdar**. Built upon a robust **Modular Monolith** architecture with **Database-per-Tenant isolation**, Awais HR delivers enterprise-grade operational security, SOC 2 / GDPR compliance readiness, Maker-Checker two-person integrity, time-bound approval delegations, atomic payroll snapshot ledgers, and a zero-latency real-time observability suite.

---

## 🎨 Enterprise UI/UX Design System & Color Palette

Created specifically for the **Awais HR Workspace Interface**, the design system delivers a modern, accessible (WCAG 2.2 AA compliant), high-contrast aesthetic with custom HSL/HEX design tokens defined in `frontend/src/styles/variables.css`.

### 1. Brand & Accent Tokens
- `primary`: `#2563EB` (Royal Blue - Main CTA, Active Navigation & Focus Rings)
- `primary-hover`: `#1D4ED8` (Button Hover State)
- `primary-active`: `#1E40AF` (Button Pressed State)
- `primary-light`: `#EFF6FF` (Light Blue Background Tint for Active Tabs)
- `primary-subtle`: `#DBEAFE` (Subtle Selection Badges & Border Highlights)

### 2. Surface & Workspace Foundations
- `bg-primary`: `#F8FAFC` (Slate 50 - Workspace Main Canvas Background)
- `bg-secondary`: `#FFFFFF` (White - Interactive Cards, Modals, Drawers)
- `bg-surface-alt`: `#F1F5F9` (Slate 100 - Table Headers & Sub-panels)
- `bg-sidebar`: `#FFFFFF` (Fixed Navigation Sidebar Background)
- `border-default`: `#E2E8F0` (Slate 200 - Grid Dividers & Borders)

### 3. Semantic Status Indicators
- **Success (`#16A34A` / `#F0FDF4`)**: Approved Workflows, Active Employee Status, Positive LED Indicators.
- **Warning (`#D97706` / `#FFFBEB`)**: Pending Approvals, Action Required, Probationary Badges.
- **Danger (`#DC2626` / `#FEF2F2`)**: Rejected Claims, Termination Actions, Deletion Confirms.
- **Info (`#0284C7` / `#F0F9FF`)**: System Notifications, Informational Tooltips.

---

## ⚡ Core SaaS Feature Modules

Designed and implemented by **Muhammad Awais Safdar**, Awais HR encompasses 12 core enterprise domains and 65 functional modules:

1. 👥 **Core HR & Employee 360**: Employee directory, department hierarchy, org chart visualizer, custom RBAC permissions, and access scopes (`SELF`, `TEAM`, `DEPARTMENT`, `COMPANY`, `GLOBAL`).
2. 💼 **Recruitment & ATS Pipeline**: Job requisition dual control ($Maker \neq Checker$), candidate stage tracking (`APPLIED` ➔ `SCREENING` ➔ `OFFER` ➔ `HIRED`), and candidate auto-provisioning into core HR.
3. 🚀 **Onboarding Clearance Engine**: Cross-department task management across IT, HR, Finance, and Facilities with status completion guards (`PROBATION` ➔ `ACTIVE`).
4. 🔄 **Employee Lifecycle State Machine**: Full lifecycle tracking (`PROBATION`, `ACTIVE`, `SUSPENDED`, `NOTICE_PERIOD`, `TERMINATED`) with event history logging.
5. 🏖️ **Leave & Absence Management**: Multi-tier leave request workflows, double-booking date overlap protection, and atomic snapshot balance ledgers.
6. 📈 **Salary & Compensation**: Maker-Checker salary revision proposals, effective date snapshot logs (`employee_salary_history`), and retroactive audit trails.
7. 💰 **Multi-Currency Payroll Engine**: Calculation engine, dual control approvals, period lock guards (`LOCKED` / `DISBURSED`), and immutable payslip snapshot ledgers (`payslip_ledger`).
8. 📊 **Multi-Tier Expense Claims**: Threshold-based routing ($\le\$500$ Line Manager, $\le\$2,500$ Finance Admin, $>\$2,500$ CFO) with self-approval guards.
9. 📋 **Scoped Task Management**: Project task Kanban boards, status history logs, and team/department data boundary security.
10. 🎯 **Performance 360 Appraisals**: Multi-stage review cycles (`SELF_APPRAISAL` ➔ `PEER_REVIEW` ➔ `MANAGER_REVIEW` ➔ `CALIBRATION`), rating scale guards ($1-5$), and score distribution metrics.
11. 🚪 **Offboarding & Access Revocation**: Exit resignation forms, asset return checklists, final settlement calculations, and instant post-termination JWT access revocation.
12. 🔐 **Enterprise Security & Compliance Audit**: Multi-tenant database routing, `@HasPermission` AOP authorization, `@Auditable` declarative logging with PII/password sanitization.

---

## 🏛️ Architecture & Governance Registry

- 📄 **Master Workflow Architecture**: [ENTERPRISE_WORKFLOW_ARCHITECTURE.md](docs/ENTERPRISE_WORKFLOW_ARCHITECTURE.md)
- 📊 **Feature Completion Matrix**: [EXISTING_FEATURE_COMPLETION_MATRIX.md](docs/qa/EXISTING_FEATURE_COMPLETION_MATRIX.md)
- 🧪 **Full SIT Test Plan & Execution Report**: [FULL_SIT_PLAN.md](docs/qa/FULL_SIT_PLAN.md) \| [FULL_SIT_EXECUTION_REPORT.md](docs/qa/FULL_SIT_EXECUTION_REPORT.md)
- 🏬 **Market Rehearsal Plan & Execution Report**: [MARKET_REHEARSAL_PLAN.md](docs/qa/MARKET_REHEARSAL_PLAN.md) \| [MARKET_REHEARSAL_EXECUTION_REPORT.md](docs/qa/MARKET_REHEARSAL_EXECUTION_REPORT.md)
- 🐞 **Defect Register & Regression Suite**: [DEFECT_REGISTER.md](docs/qa/DEFECT_REGISTER.md)
- 🎯 **Release Candidate Sign-off Report**: [RELEASE_CANDIDATE_REPORT.md](docs/release/RELEASE_CANDIDATE_REPORT.md)
- 🔌 **Frontend-Backend Alignment Audit**: [FRONTEND_BACKEND_ALIGNMENT_AUDIT.md](docs/qa/FRONTEND_BACKEND_ALIGNMENT_AUDIT.md)
- 🐋 **Senior DevOps Containerization Guide**: [DOCKER_DEVOPS_GUIDE.md](docs/DOCKER_DEVOPS_GUIDE.md)

---

## 🛠️ Technology Stack

### Backend Engine
- **Language & Framework**: Java 21 LTS / Spring Boot 3.3.1
- **Security Architecture**: Spring Security (Stateless Bearer JWT Authentication & Dynamic CORS Origin Pattern Matching)
- **Data Access & Performance**: Spring JDBC Template with raw optimized queries for sub-millisecond multi-tenant execution
- **Database Migrations**: Flyway Migration Registry (`V1` to `V64`)
- **AOP & Governance**: AspectJ declarative security (`@HasPermission`) & audit logging (`@Auditable`)

### Frontend Web Portal
- **Framework**: Next.js 14+ / React 18 (App Router with `standalone` production build output)
- **Styling & UI Components**: Vanilla CSS Tokens (`variables.css`), TailwindCSS, Lucide Icons, Framer Motion
- **HTTP Communications**: Custom `apiClient` with native Fetch wrapper, auto-injection of Bearer JWT and `X-Tenant` headers, and standardized error parsing

### Infrastructure & Observability
- **Database Engine**: MySQL 8.0 (UTF8MB4 Collation, Master + Dynamic Tenant Schemas)
- **Cache Layer**: Redis 7 (LRU memory eviction policy & tenant-prefixed cache keys)
- **Telemetry Suite**: Grafana 10.4, Prometheus 2.51, Loki 2.9, Tempo 2.4, Promtail 3.0, Alertmanager 0.27

---

## 🐋 Production Deployment & Execution

### One-Command Senior DevOps Deployment
To launch the complete Awais HR production stack:

```bash
./docker-deploy.sh
```

### Manual Docker Compose Command
```bash
docker compose up -d --build
```

---

## 📜 License & Copyright

**© 2026 Awais HR Enterprise SaaS Platform**. Architected and Developed by **Muhammad Awais Safdar**. All Rights Reserved.
