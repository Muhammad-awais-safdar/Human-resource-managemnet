# Awais HR Engine — Enterprise Modules & Role Hierarchy Architecture Guide

This comprehensive reference guide details every functional module within **Awais HR System**, describing its core functional scope, technical route endpoints, strict role hierarchy, and permission access matrix.

---

## 👑 1. Complete Dual-Scope Role Hierarchy

Awais HR enforces a strict **Dual-Scope Role-Based Access Control (RBAC)** architecture separating SaaS Platform Operations (Product Owner Master Scope) from Organization Workspaces (Tenant Scope):

### 🌐 A. Platform Super Admin Scope (Master DB Schema)

```
                               ┌─────────────────────────────────────────┐
                               │               SUPER_ADMIN               │
                               │   (Platform Control & Full Access)      │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 ▼                                  ▼                                  ▼
      ┌─────────────────────┐            ┌─────────────────────┐            ┌─────────────────────┐
      │   SUPPORT_ENGINEER  │            │   FINANCE_AUDITOR   │            │   PRODUCT_OPERATOR  │
      │ (Tenant Debug Logs) │            │ (SaaS MRR/ARR Audit)│            │(Global Feature Flags│
      └─────────────────────┘            └─────────────────────┘            └─────────────────────┘
```

### 🏢 B. Tenant Workspace Scope (Tenant DB Schema)

```
                               ┌─────────────────────────────────────────┐
                               │              TENANT_ADMIN               │
                               │  (Tenant Workspace Root Control)        │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 ▼                                  ▼                                  ▼
      ┌─────────────────────┐            ┌─────────────────────┐            ┌─────────────────────┐
      │     GROUP_CHRO      │            │       CFO           │            │    DEPARTMENT_HEAD   │
      │    / HR_MANAGER     │            │   / FINANCE_ADMIN   │            │   / LINE_MANAGER    │
      └──────────┬──────────┘            └──────────┬──────────┘            └──────────┬──────────┘
                 │                                  │                                  │
                 ▼                                  ▼                                  ▼
      ┌─────────────────────┐            ┌─────────────────────┐            ┌─────────────────────┐
      │     RECRUITER       │            │   PAYROLL_OFFICER   │            │      EMPLOYEE       │
      │  (ATS / Talent)     │            │ (Disbursement Run)  │            │  (ESS Self Service) │
      └─────────────────────┘            └─────────────────────┘            └─────────────────────┘
```

---

## 🏛️ 2. Comprehensive Module Catalog & Role Access Matrix

---

### Module 1: 🔑 Authentication, Multi-Tenancy & Identity Engine
* **Route Path**: `/login`, `/register`, `/auth`
* **Functional Scope**: Handles user authentication, stateless Bearer JWT generation, multi-tenant database routing via `X-Tenant-Subdomain` header, password security (BCrypt), and Session/MFA verification.
* **Role Hierarchy & Access Controls**:
  * 🌐 **Public Access**: Any user can submit login credentials.
  * 🔑 `SUPER_ADMIN`: Access to tenant impersonation tokens for support debugging.
  * 🔒 **Role Rules**: JWT payloads carry assigned role arrays (`roles`) and tenant scope (`tenant_id`). Subdomain switching requires valid workspace membership.

---

### Module 2: 🏢 Organization Structure & Department Hierarchy
* **Route Path**: `/org-chart`, `/org-units`
* **Functional Scope**: Manages dynamic organizational structure, legal entities, cost centers, department units (`org_unit`), department managers (`manager_id`), and interactive visual Org Tree rendering.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Full CRUD authority. Can create new department units, assign department managers, link employees to departments (`org_unit_id`), and re-structure parent-child hierarchy nodes.
  * 👔 `LINE_MANAGER`: View department hierarchy, access direct reports list, and open employee detail cards.
  * 👤 `EMPLOYEE`: Read-only access to interactive company Org Chart and modal employee list.

---

### Module 3: 👥 Employee Lifecycle Management & Corporate Directory
* **Route Path**: `/employees`, `/employee-lifecycle`
* **Functional Scope**: End-to-end employee lifecycle management from hiring and onboarding to probation tracking, department transfers, promotion cycles, exit interviews, and offboarding.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Full management authority. Create employee profiles, assign role badges, edit base salary structures, trigger status transitions (`ACTIVE`, `PROBATION`, `TERMINATED`), and execute offboarding workflows.
  * 👔 `LINE_MANAGER`: View team profiles, monitor direct reports' probation benchmarks, and submit manager recommendation notes.
  * 👤 `EMPLOYEE`: Access personal profile (`/profile`), update emergency contact info, and view public employee directory cards.

---

### Module 4: 🏖️ Vacation, Time-Off & Leave Control
* **Route Path**: `/leaves`
* **Functional Scope**: Configures annual leave policies (Casual, Sick, Maternity, Paternity, Unpaid LOP), tracks annual leave quotas, processes time-off applications, and displays overlapping team leave calendars.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN`, `HR_MANAGER`, `LINE_MANAGER`: Access full department/company leave requests table (`Leave Applications & Approvals`). Can approve or reject pending employee leave applications. **Self-approval is strictly prohibited by backend & UI guards.**
  * 👤 `EMPLOYEE`: Can view **ONLY** their own pending, approved, or rejected leave requests (`My Leave Applications`). Access **"Apply for Leave"** modal to submit new leave applications. Cannot see approve/reject buttons for any requests.

---

### Module 5: ⏰ Attendance, Time Tracking & Shift Roster
* **Route Path**: `/attendance`, `/shifts`, `/clock-in`
* **Functional Scope**: Real-time geolocation/geofenced clock-in & clock-out logging, automated biometric device sync, shift roster scheduling, overtime calculation, and monthly attendance audit sheets.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Global attendance rule configuration, geofence radius definition, manual attendance overrides, and company-wide export logs.
  * 👔 `LINE_MANAGER`: Approve direct report overtime hours, swap team shift rosters, and review weekly team attendance summary.
  * 👤 `EMPLOYEE`: Single-click web clock-in/clock-out, view personal attendance log calendar, and submit attendance regularization requests.

---

### Module 6: 💳 Multi-Currency Automated Payroll Engine
* **Route Path**: `/payroll`, `/disbursements`
* **Functional Scope**: Automated salary computation, multi-currency support, tax bracket calculation (Pakistan FBR income tax slabs / International tax withholding), allowance/deduction line items, batch disbursement payouts (Raast, HBL, NACHA, Wise API), and PDF payslip generation.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN`, `CFO`, `FINANCE_ADMIN`, `PAYROLL_OFFICER`: Full access to execute payroll runs, lock monthly salary structures, initiate encrypted batch bank disbursements, and generate tax audit statements.
  * 👤 `EMPLOYEE`: Secure access to Employee Self-Service (ESS) Payslip Vault (`/payslips`) to download monthly PDF payslips. Strictly forbidden from viewing company-wide salary rosters or executing disbursements.

---

### Module 7: 🧾 Expense Claims & Reimbursements
* **Route Path**: `/expenses`
* **Functional Scope**: Employee business expense submission, receipt photo/document attachment upload, multi-level approval pipeline (Line Manager -> Finance Clearance), and payment reimbursement tracking.
* **Role Hierarchy & Access Controls**:
  * 👤 `EMPLOYEE`: Submit new expense reimbursement claims with receipt proof, select expense category (Travel, Fuel, Client Dinner, Equipment), and track reimbursement payout status.
  * 👔 `LINE_MANAGER`: Review and approve/reject business necessity of direct reports' expense claims.
  * 👑 `FINANCE_ADMIN` & `CFO`: Final financial clearance and payout execution for approved expense claims.

---

### Module 8: 🎯 Performance Appraisals, OKRs & Goal Tracking
* **Route Path**: `/performance`, `/okrs`
* **Functional Scope**: Quarterly performance review cycles, 360-degree feedback, Key Performance Indicators (KPIs), Objective & Key Results (OKRs), performance rating calibration curves, and promotion eligibility matrices.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Setup review cycles, define company OKRs, configure rating scales, and run performance calibration reports.
  * 👔 `LINE_MANAGER`: Complete manager performance evaluations for direct reports, rate goals, and conduct review meetings.
  * 👤 `EMPLOYEE`: Fill self-appraisal forms, track assigned quarterly OKRs, and view finalized performance review feedback.

---

### Module 9: 💼 Applicant Tracking System (ATS) & Recruitment
* **Route Path**: `/ats`, `/careers`
* **Functional Scope**: Job opening creation, public career portal job publishing, AI resume parsing, candidate pipeline kanban board (Applied, Screened, Interview, Offer, Hired), interview scheduling, and offer letter generation.
* **Role Hierarchy & Access Controls**:
  * 👑 `HR_MANAGER` & `RECRUITER`: Post new job requisitions, parse resumes, move candidates across recruitment stages, schedule interviews, and issue offer letters.
  * 👔 `LINE_MANAGER`: Access candidate profiles assigned to their department for technical interview rounds and submit interview scorecards.
  * 👤 `EMPLOYEE`: Can view internal job postings and submit employee referral applications.

---

### Module 10: 💻 Asset & Hardware Fleet Management
* **Route Path**: `/assets`
* **Functional Scope**: IT equipment inventory management (Laptops, Monitors, Mobile Devices), serial number tracking, asset assignment to employees, repair maintenance logs, and exit asset recovery checklists.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Register new hardware assets, allocate assets to employees, mark assets under maintenance or decommissioned, and audit unreturned assets.
  * 👤 `EMPLOYEE`: View list of company assets assigned to them with hardware specs and request IT hardware maintenance.

---

### Module 11: 📊 Executive Analytics & BI Dashboard
* **Route Path**: `/dashboard`
* **Functional Scope**: High-level corporate HR metrics including headcount trends, turnover rate, gender/department diversity ratios, payroll cost burn rate, and leave utilization heatmaps.
* **Role Hierarchy & Access Controls**:
  * 👑 `TENANT_ADMIN`, `GROUP_CHRO`, `CFO`: Full access to executive BI widgets, financial charts, and headcount forecasts.
  * 👔 `LINE_MANAGER`: Access department-level operational dashboards (team presence, upcoming leaves, pending approvals).
  * 👤 `EMPLOYEE`: Access Employee ESS Dashboard (personal metrics, remaining leave balances, upcoming holidays, quick task list).

---

### Module 12: 🛰️ Super Admin SaaS Observability & Feature Flags
* **Route Path**: `/superadmin/observability`, `/superadmin/modules`
* **Functional Scope**: SaaS platform telemetry, tenant subscription billing overrides, server log tailing (`tail -f`), Grafana/Prometheus metric monitoring, Loki log streams, and global module kill-switches.
* **Role Hierarchy & Access Controls**:
  * 👑 `SUPER_ADMIN`: Unlimited platform control across all tenant schemas.
  * 🛠️ `SUPPORT_ENGINEER`: Read-only access to tenant log streams, OpenTelemetry traces, and system health status.
  * 💰 `FINANCE_AUDITOR`: Read-only access to SaaS MRR/ARR subscription billing logs.

---

## 🔒 3. Enforcement Mechanisms Matrix

| Layer | Guard Technique | Enforcement Details |
| :--- | :--- | :--- |
| **Database Level** | Multi-Tenant Dynamic Schema + SQL Filters | Queries filter records by `employee_id` or `tenant_id` (e.g. employee leave query enforces `WHERE r.employee_id = ?`). |
| **Backend AOP Aspect** | Spring Security `@HasPermission` & `@RequiresRole` | Intercepts REST calls; throws `AccessDeniedException` (HTTP 403) or `SecurityException`. |
| **Frontend UI Layer** | `usePermissions()` Hook | Dynamically removes action buttons, management tabs, and approval options for unauthorized user roles. |
