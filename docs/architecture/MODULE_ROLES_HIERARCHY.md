# Awais HR Engine — Enterprise Modules & Role Hierarchy Architecture Guide

This comprehensive reference guide details **all 66 functional business modules** within the **Awais HR System**, describing each module's core functional scope, frontend/backend route endpoints, strict role hierarchy, and complete permission access matrix.

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

## 🏛️ 2. Comprehensive Catalog of All 66 Modules & Role Access Matrix

Below is the exhaustive documentation covering all 66 modules categorized into 10 specialized domain suites:

---

### 🔑 DOMAIN 1: SaaS Core Architecture, Security & Governance

#### Module 1: 🔑 Authentication & Identity Management (`/login`, `/auth`)
* **Backend Directory**: `com.awais.hr.module.auth`
* **Functional Scope**: Handles user authentication, stateless Bearer JWT issuance, BCrypt password security, session validation, and MFA challenge verification.
* **Role Hierarchy & Access Rules**:
  * 🌐 **Public / All Users**: Access `/login` and submit login credentials.
  * 🔒 **Role Rules**: JWT tokens carry role claims (`roles`) and tenant scope (`tenant_id`).

#### Module 2: 🏢 Multi-Tenant Management & Dynamic Schemas (`/tenants`, `/superadmin/tenants`)
* **Backend Directory**: `com.awais.hr.module.tenant`
* **Functional Scope**: Provisioning multi-tenant databases (`Database-per-Tenant`), subdomain routing (`X-Tenant-Subdomain`), and isolation boundaries.
* **Role Hierarchy & Access Rules**:
  * 👑 `SUPER_ADMIN`: Provision new tenants, suspend delinquent workspaces, and configure DB connection pools.
  * 🏢 `TENANT_ADMIN`: Configure tenant workspace metadata, custom domain name, and corporate brand colors.

#### Module 3: 🔒 Single Sign-On (SSO) Engine (`/sso`)
* **Backend Directory**: `com.awais.hr.module.sso`
* **Functional Scope**: Enterprise SAML 2.0, OAuth2, and OpenID Connect (OIDC) integration for Microsoft Entra ID, Okta, and Google Workspace.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`: Configure SSO Identity Provider (IdP) metadata, Certificate keys, and automated user provisioning rules.

#### Module 4: 💳 SaaS Subscription Billing & Seat Overages (`/billing`, `/superadmin/billing`)
* **Backend Directory**: `com.awais.hr.module.billing`
* **Functional Scope**: Subscription tier management (Starter, Growth, Enterprise), seat overage billing calculation, dynamic gateway integration (Stripe, JazzCash, Raast).
* **Role Hierarchy & Access Rules**:
  * 👑 `SUPER_ADMIN` & `FINANCE_AUDITOR`: View platform MRR/ARR, grant subscription billing overrides, and manage plans.
  * 🏢 `TENANT_ADMIN`: View workspace subscription, upgrade plans, purchase additional seat licenses, and download invoices.

#### Module 5: ⚙️ Workspace System Settings (`/settings`)
* **Backend Directory**: `com.awais.hr.module.settings`
* **Functional Scope**: Configures organization-wide preferences, timezone defaults, currency formats, notification channels, and operational rules.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`: Full CRUD authority for organizational settings.

#### Module 6: 🔐 RBAC & Permission Matrix Engine (`/roles`, `/superadmin/rbac`)
* **Backend Directory**: `com.awais.hr.module.enterpriseadmin`
* **Functional Scope**: Custom workspace role creation, granular permission assignment matrix, and AOP security aspect enforcement.
* **Role Hierarchy & Access Rules**:
  * 👑 `SUPER_ADMIN` & `TENANT_ADMIN`: Full management of workspace security roles and permission mappings.

---

### 👥 DOMAIN 2: Core HR, Employee Lifecycle & Org Hierarchy

#### Module 7: 👤 Employee Master Directory (`/employees`)
* **Backend Directory**: `com.awais.hr.module.employee`
* **Functional Scope**: Centralized employee master database, personal profile files, employment status tracking (`ACTIVE`, `PROBATION`, `TERMINATED`).
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Create, edit, suspend, and manage all employee records.
  * 👔 `LINE_MANAGER`: View direct reports' profile cards.
  * 👤 `EMPLOYEE`: Access personal profile (`/profile`) and public corporate directory.

#### Module 8: 🏢 Organization Structure & Department Hierarchy (`/org-chart`, `/org-units`)
* **Backend Directory**: `com.awais.hr.module.org`
* **Functional Scope**: Manages legal entities, cost centers, department units (`org_unit`), department heads (`manager_id`), and interactive visual Org Chart.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Full CRUD authority. Assign department managers and link employees to departments (`org_unit_id`).
  * 👔 `LINE_MANAGER`: View team hierarchy and direct reports.
  * 👤 `EMPLOYEE`: Read-only view of company Org Chart.

#### Module 9: 🚀 Digital Employee Onboarding (`/onboarding`)
* **Backend Directory**: `com.awais.hr.module.onboarding`
* **Functional Scope**: Pre-hire task checklists, document submission portals, IT equipment requests, and manager welcome kits.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Create onboarding templates and monitor completion status.
  * 👤 `EMPLOYEE` (New Hire): Complete assigned onboarding checklists and upload required identity documents.

#### Module 10: 🚪 Employee Offboarding & Exit Clearance (`/offboarding`)
* **Backend Directory**: `com.awais.hr.module.offboarding`
* **Functional Scope**: Resignation workflows, exit interviews, IT asset recovery checklists, and final settlement handoffs.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & `FINANCE_ADMIN`: Manage offboarding tasks, conduct exit interviews, and issue final clearance certificates.

#### Module 11: 🪪 Employee 360 Profile Vault (`/profile`)
* **Backend Directory**: `com.awais.hr.module.employee360`
* **Functional Scope**: 360-degree view of employee credentials, work history, document repository, emergency contacts, and skill tags.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Full read/write access to employee 360 files.
  * 👤 `EMPLOYEE`: View and update own personal details and emergency contacts.

#### Module 12: 🔄 Lifecycle Transitions & Probation (`/lifecycle`)
* **Backend Directory**: `com.awais.hr.module.employee`
* **Functional Scope**: Tracks probation period evaluations, department transfers, job title promotions, and salary adjustments.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Approve probation confirmations, transfers, and promotion cycles.
  * 👔 `LINE_MANAGER`: Submit probation evaluation reviews and promotion recommendations.

#### Module 13: 🤝 Contractor & Freelancer Management (`/contractor`)
* **Backend Directory**: `com.awais.hr.module.contractor`
* **Functional Scope**: Manages contingent workforce, vendor contracts, hourly rate agreements, and invoice approvals.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & `FINANCE_ADMIN`: Onboard contractors and verify milestone deliverables for payment.

#### Module 14: 🪪 Visitor Management & Logbook (`/visitors`)
* **Backend Directory**: `com.awais.hr.module.visitor`
* **Functional Scope**: Office building visitor pre-registration, digital badge issuing, host notification alerts, and security logbooks.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` / Front Desk Admin: Register office visitors and issue digital guest badges.
  * 👤 `EMPLOYEE`: Pre-register expected guest visits.

---

### ⏰ DOMAIN 3: Time, Absence & Shift Management

#### Module 15: 🏖️ Vacation & Leave Control (`/leaves`)
* **Backend Directory**: `com.awais.hr.module.leave`
* **Functional Scope**: Configures annual leave policies, tracks annual leave quotas, processes time-off applications, and renders team leave calendars.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`, `HR_MANAGER`, `LINE_MANAGER`: View company/department leave requests table. Approve or reject pending leave applications. **Self-approval is strictly prohibited by backend & UI guards.**
  * 👤 `EMPLOYEE`: View **ONLY** own pending, approved, or rejected leave requests (`My Leave Applications`). Access **"Apply for Leave"** modal to submit new leave applications. Cannot see approve/reject buttons.

#### Module 16: ⏰ Attendance & Time Tracking (`/attendance`, `/clock-in`)
* **Backend Directory**: `com.awais.hr.module.attendance`
* **Functional Scope**: Real-time geofenced clock-in/out logging, biometric hardware sync, overtime calculation, and monthly attendance sheets.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Define geofence boundaries, override attendance anomalies, and export payroll attendance logs.
  * 👔 `LINE_MANAGER`: Approve overtime requests and review team attendance.
  * 👤 `EMPLOYEE`: Clock-in/clock-out via web portal and view personal attendance logs.

#### Module 17: 📅 Shift Scheduling & Roster Roster (`/shifts`)
* **Backend Directory**: `com.awais.hr.module.shift`
* **Functional Scope**: Shift pattern creation, automated roster scheduling, peer shift swapping, and night shift allowance tracking.
* **Role Hierarchy & Access Rules**:
  * 👔 `LINE_MANAGER` & `HR_MANAGER`: Create shift rosters and approve shift swap requests.
  * 👤 `EMPLOYEE`: View assigned shift calendar and request peer shift swaps.

#### Module 18: 🌴 Statutory & Company Holiday Calendar (`/holidays`)
* **Backend Directory**: `com.awais.hr.module.holiday`
* **Functional Scope**: Configures national statutory holidays, regional public holidays, and custom company floating days off.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Define annual holiday calendars.
  * 👤 `EMPLOYEE`: Read-only view of active holiday schedule.

---

### 💳 DOMAIN 4: Compensation, Multi-Currency Payroll & Financials

#### Module 19: 💰 Multi-Currency Automated Payroll Engine (`/payroll`)
* **Backend Directory**: `com.awais.hr.module.payroll`
* **Functional Scope**: Salary computation, tax bracket calculations (FBR Pakistan / International), allowance/deduction lines, and PDF payslip rendering.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`, `CFO`, `FINANCE_ADMIN`, `PAYROLL_OFFICER`: Full access to execute payroll runs and lock monthly salary structures.
  * 👤 `EMPLOYEE`: Access personal ESS Payslip Vault (`/payslips`) to download monthly payslips.

#### Module 20: 💵 Salary Structure & Grade Slabs (`/salary-structure`)
* **Backend Directory**: `com.awais.hr.module.salarystructure`
* **Functional Scope**: Salary band definitions, grade level base pay, basic/HRA/utility breakdown rules, and compensation structures.
* **Role Hierarchy & Access Rules**:
  * 👑 `CFO` & `HR_MANAGER`: Configure salary bands and pay grade policy rules.

#### Module 21: 🏦 Bank Payroll Batch Payout Engine (`/disbursements`)
* **Backend Directory**: `com.awais.hr.module.bankpayroll`
* **Functional Scope**: Encrypted batch payout engine supporting State Bank Raast IBAN direct transfers, HBL corporate clearance, US NACHA ACH, and Wise API.
* **Role Hierarchy & Access Rules**:
  * 👑 `CFO` & `PAYROLL_OFFICER`: Authorize and execute encrypted batch bank disbursement payouts.

#### Module 22: 🧾 Expense Claims & Reimbursements (`/expenses`)
* **Backend Directory**: `com.awais.hr.module.expense`
* **Functional Scope**: Business expense submission, receipt photo upload, multi-level approval pipeline, and payment reimbursement clearance.
* **Role Hierarchy & Access Rules**:
  * 👤 `EMPLOYEE`: Submit reimbursement claims with receipt proof and track claim status.
  * 👔 `LINE_MANAGER`: Review business necessity of direct reports' expense claims.
  * 👑 `FINANCE_ADMIN`: Execute final financial payout clearance for approved claims.

#### Module 23: 🏥 Employee Benefits & Health Insurance (`/benefits`)
* **Backend Directory**: `com.awais.hr.module.benefits`
* **Functional Scope**: Group medical insurance enrollment, outpatient medical claim reimbursements, and flex benefit allocations.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Manage benefit coverage plans and process insurance claims.
  * 👤 `EMPLOYEE`: View active insurance coverage details and submit medical claim documents.

#### Module 24: 📈 Total Rewards & Stock Equity Admin (`/compensation`)
* **Backend Directory**: `com.awais.hr.module.compensation`
* **Functional Scope**: Executive stock option grants (ESOPs), annual bonus allocation matrices, and total rewards statements.
* **Role Hierarchy & Access Rules**:
  * 👑 `CFO` & `TENANT_ADMIN`: Manage equity pools, vesting schedules, and bonus distributions.

---

### 🎯 DOMAIN 5: Performance, Talent, Learning & Succession

#### Module 25: 🎯 Performance Appraisals & Ratings (`/performance`)
* **Backend Directory**: `com.awais.hr.module.performance`
* **Functional Scope**: Quarterly performance review cycles, 360-degree feedback, performance calibration curves, and rating matrices.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Setup review cycles and configure rating scales.
  * 👔 `LINE_MANAGER`: Complete manager performance evaluations for direct reports.
  * 👤 `EMPLOYEE`: Complete self-appraisal forms and view finalized review feedback.

#### Module 26: 🎯 OKR & Goal Tracking (`/okrs`)
* **Backend Directory**: `com.awais.hr.module.performance`
* **Functional Scope**: Company, department, and individual Objective & Key Results (OKRs) goal tracking with visual progress meters.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`: Define company-wide annual strategic OKRs.
  * 👔 `LINE_MANAGER`: Align team key results with corporate goals.
  * 👤 `EMPLOYEE`: Update progress on assigned key results.

#### Module 27: 📚 Learning Management System (LMS) (`/learning`)
* **Backend Directory**: `com.awais.hr.module.learning`
* **Functional Scope**: Corporate training course creation, video module catalog, compliance quizzes, and skill certification tracking.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Upload training courses and assign mandatory compliance courses.
  * 👤 `EMPLOYEE`: Complete assigned training modules and earn certificates.

#### Module 28: 🚀 Career Paths & Development (`/career-development`)
* **Backend Directory**: `com.awais.hr.module.career`
* **Functional Scope**: Dual-ladder career progression paths, competency gap analysis, and mentorship pairing programs.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Define role competency frameworks and career matrices.
  * 👤 `EMPLOYEE`: Explore career path milestones and request mentorship pairing.

#### Module 29: 👑 Succession Planning & 9-Box Grid (`/succession`)
* **Backend Directory**: `com.awais.hr.module.succession`
* **Functional Scope**: Critical role vacancy risk analysis, talent pipeline pools, and interactive 9-Box Performance vs. Potential Grid.
* **Role Hierarchy & Access Rules**:
  * 👑 `GROUP_CHRO` & `TENANT_ADMIN`: Access succession planning pools, evaluate high-potentials, and map emergency successors.

#### Module 30: 📊 Employee Engagement & Pulse Surveys (`/engagement`)
* **Backend Directory**: `com.awais.hr.module.engagement`
* **Functional Scope**: Anonymous employee eNPS pulse surveys, workplace satisfaction analytics, and morale heatmaps.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Launch anonymous pulse surveys and analyze aggregated sentiment reports.
  * 👤 `EMPLOYEE`: Submit confidential pulse survey responses.

---

### 💼 DOMAIN 6: ATS Recruitment & AI Talent Acquisition

#### Module 31: 💼 Applicant Tracking System (ATS) (`/recruitment`)
* **Backend Directory**: `com.awais.hr.module.recruitment`
* **Functional Scope**: Job posting management, public career portal publishing, applicant kanban pipeline, interview scheduling, and offer letters.
* **Role Hierarchy & Access Rules**:
  * 👑 `RECRUITER` & `HR_MANAGER`: Manage job requisitions, advance candidates across stages, and issue offer letters.
  * 👔 `LINE_MANAGER`: Evaluate technical candidates and submit interview scorecards.

#### Module 32: 🌐 External Career Portal & Job Boards (`/recruitmentext`)
* **Backend Directory**: `com.awais.hr.module.recruitmentext`
* **Functional Scope**: Automated job syndication to external job portals (LinkedIn, Indeed), candidate application intake, and candidate status tracking.
* **Role Hierarchy & Access Rules**:
  * 👑 `RECRUITER`: Manage job posting syndication feeds.

#### Module 33: 🤖 AI Resume Parsing Engine (`/ai`)
* **Backend Directory**: `com.awais.hr.module.ai`
* **Functional Scope**: Automated PDF/DOCX resume text extraction, skill keyword tagging, and job match relevance scoring.
* **Role Hierarchy & Access Rules**:
  * 👑 `RECRUITER` & `HR_MANAGER`: Trigger AI resume parsing on incoming candidate batches.

#### Module 34: 🤖 AI HR Copilot & Assistant (`/ai-copilot`)
* **Backend Directory**: `com.awais.hr.module.aicopilot`
* **Functional Scope**: Natural language AI assistant for drafting job descriptions, policy queries, employee Q&A bot, and automated interview question generator.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & `LINE_MANAGER`: Utilize AI copilot to generate job specs and HR content.

---

### 🛠️ DOMAIN 7: Operations, Asset Fleet & Compliance

#### Module 35: 💻 IT Asset & Hardware Fleet Management (`/assets`)
* **Backend Directory**: `com.awais.hr.module.asset`
* **Functional Scope**: Hardware inventory registration (Laptops, Monitors), serial number tracking, asset assignments, repair maintenance, and exit recovery.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Register hardware assets, allocate equipment to employees, and audit unreturned hardware.
  * 👤 `EMPLOYEE`: View assigned company assets and submit hardware repair requests.

#### Module 36: 📄 Enterprise Document Management & E-Sign (`/document`)
* **Backend Directory**: `com.awais.hr.module.document`
* **Functional Scope**: Company policy document library, employment contract vault, NDA storage, and electronic signature collection.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Upload company policy PDFs and request employee e-signatures.
  * 👤 `EMPLOYEE`: Access employee handbook and e-sign assigned contracts.

#### Module 37: 🦺 Environmental Health, Safety & EHS (`/health-safety`)
* **Backend Directory**: `com.awais.hr.module.healthsafety`
* **Functional Scope**: Workplace injury reporting, OSHA safety compliance audits, hazard logging, and emergency drill tracking.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & Safety Officer: Investigate safety incidents and log corrective action reports.
  * 👤 `EMPLOYEE`: Report workplace safety hazards or injuries instantly.

#### Module 38: ⚖️ Statutory Compliance & Audit Readiness (`/compliance-management`)
* **Backend Directory**: `com.awais.hr.module.compliance`
* **Functional Scope**: Labor law statutory compliance monitoring, labor inspection readiness, equal opportunity reporting, and regulatory audit trail.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & Compliance Officer: Monitor compliance health scores and generate statutory regulatory exports.

#### Module 39: 🛡️ Audit Center & Security Logbook (`/audit`)
* **Backend Directory**: `com.awais.hr.module.auditcenter`
* **Functional Scope**: System-wide immutable change audit logs, user login IP tracking, permission alteration history, and data export logs.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN` & `SUPER_ADMIN`: Inspect system security audit logs and filter user activity traces.

#### Module 40: 🔄 Business Continuity & Risk Resilience (`/business-continuity`)
* **Backend Directory**: `com.awais.hr.module.businesscontinuity`
* **Functional Scope**: Disaster recovery workforce protocols, emergency contact broadcast alerts, and operational risk registers.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`: Maintain disaster recovery plans and trigger emergency workforce broadcasts.

#### Module 41: 🎫 Helpdesk & IT Ticketing (`/ticket`)
* **Backend Directory**: `com.awais.hr.module.ticket`
* **Functional Scope**: Internal employee HR/IT helpdesk ticket creation, SLA assignment, escalation matrix, and ticket resolution workflows.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & Support Agents: Assign, respond to, and resolve internal employee tickets.
  * 👤 `EMPLOYEE`: Create helpdesk support tickets and track resolution status.

#### Module 42: 📢 Internal Communication & Broadcasts (`/internal-communication`)
* **Backend Directory**: `com.awais.hr.module.communication`
* **Functional Scope**: Organization-wide company announcements, executive newsletter broadcasts, CEO townhall alerts, and push notifications.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & `TENANT_ADMIN`: Draft and publish corporate news announcements.
  * 👤 `EMPLOYEE`: Read company news feed and acknowledge policy updates.

---

### 🏗️ DOMAIN 8: Enterprise Multi-Industry Vertical Suites

#### Module 43: 🏭 Manufacturing Industry Suite (`/manufacturing`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Factory floor multi-shift rosters, piece-rate wage calculation, machine line assignment, and factory overtime rules.
* **Role Hierarchy & Access Rules**:
  * 👑 Plant Manager & `HR_MANAGER`: Manage factory floor shifts and approve piece-rate production wages.

#### Module 44: 🏗️ Construction Industry Suite (`/construction`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Construction jobsite daily roster, site field worker mileage tracking, safety helmet compliance, and site project allowances.
* **Role Hierarchy & Access Rules**:
  * 👑 Site Engineer & `HR_MANAGER`: Track daily site attendance and log site hazard reports.

#### Module 45: 🏥 Healthcare & Hospital Suite (`/healthcare`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Hospital doctor/nurse 24/7 rotation rosters, medical license credentialing vault, call duty allowances, and locum pay.
* **Role Hierarchy & Access Rules**:
  * 👑 Medical Director & `HR_MANAGER`: Schedule clinical call shifts and verify medical license renewals.

#### Module 46: 🏪 Retail & POS Suite (`/retail`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Retail store shift scheduling, sales commission tiered calculations, store target incentives, and cashier shift audits.
* **Role Hierarchy & Access Rules**:
  * 👑 Store Manager & `HR_MANAGER`: Audit store sales targets and calculate sales commissions.

#### Module 47: 🚛 Logistics & Fleet Suite (`/logistics`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Driver trip mileage logging, delivery route allowance calculation, commercial vehicle license tracking, and rest period compliance.
* **Role Hierarchy & Access Rules**:
  * 👑 Fleet Manager & `HR_MANAGER`: Assign delivery routes and verify driver trip mileage logs.

#### Module 48: 🏦 BFSI & Banking Suite (`/bfsi`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: SBP regulatory compliance controls, bank teller branch rotations, mandatory consecutive leave compliance, and audit trails.
* **Role Hierarchy & Access Rules**:
  * 👑 Bank Compliance Head & `HR_MANAGER`: Enforce mandatory regulatory leaves and branch security rotations.

#### Module 49: 🌾 AgriTech & Farming Suite (`/agritech`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Agricultural seasonal harvest labor tracking, field crop yield payouts, farm supervisor rosters, and daily wage calculations.
* **Role Hierarchy & Access Rules**:
  * 👑 Farm Supervisor & `HR_MANAGER`: Log daily harvest yields and calculate seasonal labor payouts.

#### Module 50: 💻 IT Services & Software Agency Suite (`/it-services`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Software developer bench utilization, client billable hours tracking, project resource allocations, and tech skill matrices.
* **Role Hierarchy & Access Rules**:
  * 👑 Resource Manager & `HR_MANAGER`: Assign developers to client billable projects and track bench time.

#### Module 51: 🏨 Hospitality & Hotel Suite (`/hospitality`)
* **Backend Directory**: `com.awais.hr.module.verticals`
* **Functional Scope**: Hotel front-desk/housekeeping shift rosters, banquet event staff pooling, tip distribution calculations, and night audit shifts.
* **Role Hierarchy & Access Rules**:
  * 👑 Hotel Operations Manager & `HR_MANAGER`: Manage banquet rosters and calculate staff tip pooling.

#### Module 52: 🏢 Enterprise Extended Modules (`/extended`)
* **Backend Directory**: `com.awais.hr.module.extended`
* **Functional Scope**: Extended multi-entity conglomerate management, inter-company employee transfers, and consolidated corporate reporting.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN` & `GROUP_CHRO`: Manage inter-company transfers across subsidiary legal entities.

---

### 📊 DOMAIN 9: Analytics, Integrations & Developer Platform

#### Module 53: 📊 Business Intelligence & Tenant Analytics (`/analytics`)
* **Backend Directory**: `com.awais.hr.module.analytics`, `tenantanalytics`
* **Functional Scope**: Executive HR metrics, headcount turnover trend models, gender diversity ratios, payroll burn forecasts, and leave utilization.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`, `GROUP_CHRO`, `CFO`: Full access to executive analytics dashboards.

#### Module 54: 📈 Custom Report Builder (`/report`)
* **Backend Directory**: `com.awais.hr.module.report`
* **Functional Scope**: Drag-and-drop custom SQL report builder, scheduled PDF/Excel email reports, and headcount audit exports.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & `FINANCE_ADMIN`: Create, save, and schedule custom export reports.

#### Module 55: 🔌 Third-Party Integration Framework (`/integration`)
* **Backend Directory**: `com.awais.hr.module.integration`
* **Functional Scope**: Out-of-the-box webhooks, Zapier connectors, Slack/Microsoft Teams notifications, and enterprise ERP sync engine.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`: Configure API integrations and webhook target endpoints.

#### Module 56: 🛒 SaaS Marketplace & Add-ons (`/marketplace`)
* **Backend Directory**: `com.awais.hr.module.marketplace`
* **Functional Scope**: Browse third-party HR add-on plugins, enable specialized extensions, and manage partner integrations.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`: Install or uninstall marketplace plugins.

#### Module 57: 💻 Developer API Platform & SDKs (`/developer-platform`)
* **Backend Directory**: `com.awais.hr.module.developerplatform`
* **Functional Scope**: Generate developer API keys, configure OAuth2 client applications, inspect Swagger OpenAPI specs, and manage rate limits.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN`: Generate API client tokens and manage developer webhooks.

#### Module 58: 🔄 Custom Workflow & Approvals Engine (`/approvals`)
* **Backend Directory**: `com.awais.hr.module.workflow`, `approvals`
* **Functional Scope**: Dynamic multi-stage approval chain builder (e.g. Employee -> Line Manager -> Department Head -> HR Manager).
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER` & `TENANT_ADMIN`: Configure custom approval chains for leave, expenses, and promotions.

#### Module 59: 🔔 Smart Notifications & Alerts (`/smartnotification`)
* **Backend Directory**: `com.awais.hr.module.smartnotification`
* **Functional Scope**: Automated push notifications, email alert templates, SMS notifications, and WhatsApp HR updates.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Configure alert triggers and email notification templates.

#### Module 60: 📖 Corporate Knowledge Base & Wiki (`/knowledge-management`)
* **Backend Directory**: `com.awais.hr.module.knowledge`
* **Functional Scope**: Centralized corporate Wiki, Standard Operating Procedures (SOPs), employee handbook, and searchable policy articles.
* **Role Hierarchy & Access Rules**:
  * 👑 `HR_MANAGER`: Publish SOP documents and policy wiki articles.
  * 👤 `EMPLOYEE`: Search and read corporate wiki articles.

---

### 🌐 DOMAIN 10: Mobile, Observability & Platform Tools

#### Module 61: 📱 Mobile PWA & Offline Engine (`/mobile-enterprise`)
* **Backend Directory**: `com.awais.hr.module.mobile`, `mobileenterprise`
* **Functional Scope**: Progressive Web App (PWA) sync, offline attendance clock-in queuing, and mobile push notification receiver.
* **Role Hierarchy & Access Rules**:
  * 👤 `EMPLOYEE` & All Users: Install PWA on mobile devices for offline clock-in and ESS access.

#### Module 62: ♿ Accessibility & WCAG 2.1 Suite (`/accessibility`)
* **Backend Directory**: `com.awais.hr.module.accessibility`
* **Functional Scope**: WCAG 2.1 AA accessibility compliance, high-contrast themes, screen reader ARIA labels, and keyboard navigation.
* **Role Hierarchy & Access Rules**:
  * 🌐 **All Users**: Toggle high-contrast themes and screen reader optimization modes.

#### Module 63: 🔍 Global Search Engine (`/search`)
* **Backend Directory**: `com.awais.hr.module.search`
* **Functional Scope**: Instant global search bar across employees, policies, helpdesk tickets, documents, and navigation pages.
* **Role Hierarchy & Access Rules**:
  * 🌐 **All Users**: Results are automatically filtered according to the user's RBAC scope.

#### Module 64: 🌐 Localization & Multi-Language Engine (`/localization`)
* **Backend Directory**: `com.awais.hr.module.localization`
* **Functional Scope**: Multi-language translation engine (English, Urdu, Arabic), regional date/number formatting, and timezone handling.
* **Role Hierarchy & Access Rules**:
  * 🌐 **All Users**: Select preferred interface language and timezone settings.

#### Module 65: 📦 Data Migration & CSV Import Pipeline (`/data-migration`)
* **Backend Directory**: `com.awais.hr.module.migration`
* **Functional Scope**: Legacy HRMS data import pipeline (CSV/Excel upload), data validation engine, and bulk employee creation.
* **Role Hierarchy & Access Rules**:
  * 👑 `TENANT_ADMIN` & `HR_MANAGER`: Execute bulk data migration imports.

#### Module 66: 🛰️ Super Admin Observability & Telemetry (`/superadmin/observability`)
* **Backend Directory**: `com.awais.hr.module.observability`, `superadmin`
* **Functional Scope**: Real-time server log tailing (`tail -f`), Grafana dashboards, Prometheus metrics, Loki log streams, OpenTelemetry tracing, and global module kill-switches.
* **Role Hierarchy & Access Rules**:
  * 👑 `SUPER_ADMIN`: Full access to platform telemetry, server logs, and global feature flag kill-switches.
  * 🛠️ `SUPPORT_ENGINEER`: Read-only access to live server logs and system health telemetry.
  * 💰 `FINANCE_AUDITOR`: Read-only access to platform MRR/ARR subscription metrics.

---

## 🔒 3. Architectural Security & Permission Guards Matrix

| Security Layer | Technical Guard Mechanism | Enforcement Behavior |
| :--- | :--- | :--- |
| **Database Tier** | PostgreSQL Schema-per-Tenant + SQL Filters | Database isolation guarantees tenant data segregation; SQL `WHERE employee_id = ?` filters employee self-service records. |
| **Backend AOP Layer** | `@HasPermission` & `@RequiresRole` AspectJ | Intercepts REST endpoints; throws `SecurityException` (403 Forbidden) if user lacks role/permission. |
| **Frontend UI Layer** | `usePermissions()` Hook | Dynamically removes action buttons (e.g. Approve/Reject), admin navigation tabs, and modal triggers for unauthorized roles. |
