# Roles & Permission Access Control Matrix

This document provides a comprehensive breakdown of all system roles, administrative access levels, and module-by-module permission enforcement across the **Awais HR Multi-Tenant SaaS Platform**.

---

## 1. System Roles & Access Hierarchy

| Role Code | Role Name | System Scope | Admin Override Authority |
|---|---|---|---|
| `SYSTEM_ADMIN` / `ROLE_SYSTEM_ADMIN` | **SaaS Product Owner / Super Admin** | Multi-Tenant Platform-Wide | **FULL OVERRIDE**: Bypasses all `@HasPermission` string checks via `PermissionAspect`. |
| `TENANT_ADMIN` / `ROLE_TENANT_ADMIN` | **Tenant Workspace Administrator** | Single Tenant Workspace | **TENANT OVERRIDE**: Full administrative control within the assigned tenant context. |
| `HR_MANAGER` / `ROLE_HR_MANAGER` | **HR Department Manager** | Department / Workforce | Restricted by assigned RBAC permissions (`corehr:employee:write`, `leave:approve`, etc.). |
| `RECRUITER` / `ROLE_RECRUITER` | **Talent Acquisition Specialist** | Recruitment & Candidate ATS | Restricted to recruitment pipelines, job postings, and candidate interviews. |
| `EMPLOYEE` / `ROLE_EMPLOYEE` | **Workforce Self-Service User** | Personal Employee Self-Service | Restricted to personal ESS portals, attendance check-in, and leave submissions. |

---

## 2. Module Access Matrix by Role & Permission

Below is the detailed list of platform modules, their API endpoints, the required `@HasPermission` string, and the assigned roles authorized to access them:

### A. SaaS Platform & Super Admin Management
| Module Name | Frontend Route / Backend Path | Required Permission | Authorized Roles | Access Description |
|---|---|---|---|---|
| **SaaS Super Admin Dashboard** | `/superadmin/tenants`<br>`/suite/superadmin/**` | Global SaaS Control | `SYSTEM_ADMIN` | Multi-tenant organization provisioning, status toggles (Suspend/Activate), and platform logs. |
| **SaaS Tenant Analytics** | `/superadmin/analytics`<br>`/suite/tenant-analytics/**` | `corehr:employee:read` | `SYSTEM_ADMIN` | Live Monthly Recurring Revenue (MRR), ARR, churn risk scoring, and API volume metrics. |
| **Platform Operations** | `/platform-operations`<br>`/suite/platform-operations/**` | `corehr:employee:read` | `SYSTEM_ADMIN` | System health checks, active DB connection pools, JVM memory gauges, and live streaming. |
| **Global Security Audit** | `/audit`<br>`/suite/audit/**` | `corehr:employee:read` | `SYSTEM_ADMIN`, `TENANT_ADMIN` | Global immutable security audit ledger, failed login attempts, and policy violations. |
| **Business Continuity & Failover** | `/business-continuity`<br>`/suite/business-continuity/**` | `corehr:employee:read` | `SYSTEM_ADMIN` | High availability database cluster status, automated backup snapshots, and failover controls. |
| **Multi-Tenant Data Migration** | `/data-migration`<br>`/suite/data-migration/**` | `corehr:employee:write` | `SYSTEM_ADMIN` | Batch tenant schema upgrades, CSV user imports, and data transformation scripts. |

---

### B. Organization & Administrative Controls
| Module Name | Frontend Route / Backend Path | Required Permission | Authorized Roles | Access Description |
|---|---|---|---|---|
| **Org Chart & Hierarchy** | `/org-chart`<br>`/api/v1/org/**` | `corehr:employee:read` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER` | Visual corporate organization tree, department assignments, and management reporting lines. |
| **Workspace White-labeling** | `/settings`<br>`/api/v1/tenants/settings` | `corehr:employee:write` | `SYSTEM_ADMIN`, `TENANT_ADMIN` | Tenant primary/secondary HSL branding colors, logo upload, and custom domain setup. |
| **Roles & Security Matrix** | `/roles`<br>`/api/v1/roles/**` | `corehr:employee:write` | `SYSTEM_ADMIN`, `TENANT_ADMIN` | Granular permission assignment matrix, role creation, and authority mapping. |
| **Payroll Calculation Engine** | `/payroll`<br>`/suite/payroll/**` | `payroll:write` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER` | Tax bracket calculations, gross-to-net processing, deduction rules, and paystubs. |
| **Bank Payroll Export** | `/payroll/bank-export`<br>`/suite/bank-payroll/**` | `payroll:write` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER` | Automated NACHA / SEPA banking disbursement file generation and payment receipts. |
| **Approvals Control Center** | `/approvals`<br>`/suite/approvals/**` | `leave:approve` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER` | Multi-level approval workflows, delegation management, and pending request processing. |

---

### C. Workforce & Recruitment Modules
| Module Name | Frontend Route / Backend Path | Required Permission | Authorized Roles | Access Description |
|---|---|---|---|---|
| **Recruitment & ATS** | `/recruitment`<br>`/api/v1/recruitment/**` | `recruitment:manage` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER`, `RECRUITER` | Creating job postings, managing candidate pipelines, scheduling interviews, and issuing offer letters. |
| **Employee Milestones & Clearance** | `/lifecycle`<br>`/suite/lifecycle/**` | `corehr:employee:read` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER` | Employee onboarding checklists, probation reviews, and exit clearance workflows. |
| **Corporate Asset Management** | `/assets`<br>`/suite/assets/**` | `corehr:employee:read` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER` | Hardware asset assignment (laptops, phones), serial number logs, and return status tracking. |
| **Compliance & Audits** | `/compliance-management`<br>`/suite/compliance/**` | `corehr:employee:read` | `SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER` | Regulatory policy compliance tracking, mandatory safety acknowledgments, and audit scorecards. |

---

### D. Employee Self-Service (ESS) & Workforce Portals
| Module Name | Frontend Route / Backend Path | Required Permission | Authorized Roles | Access Description |
|---|---|---|---|---|
| **My ESS Portal** | `/ess`<br>`/api/v1/ess/**` | `ess:read` | `EMPLOYEE` | Personal profile view, downloadable salary slips, document upload, and personal settings. |
| **Team MSS Portal** | `/mss`<br>`/api/v1/mss/**` | `corehr:employee:read` | `HR_MANAGER`, `TENANT_ADMIN`, `SYSTEM_ADMIN` | Manager Self-Service dashboard to view direct reports, team attendance, and pending requests. |
| **Vacation & Leave Requests** | `/leaves`<br>`/api/v1/leaves/**` | `leave:apply` / `leave:approve` | `EMPLOYEE`, `HR_MANAGER`, `TENANT_ADMIN`, `SYSTEM_ADMIN` | Requesting annual leave, sick days, balance queries, and manager approval processing. |
| **Shift Schedule & Attendance** | `/shifts`<br>`/api/v1/attendance/**` | `attendance:checkin` | `EMPLOYEE`, `HR_MANAGER`, `TENANT_ADMIN`, `SYSTEM_ADMIN` | Employee daily geolocation clock-in/out, roster schedules, and overtime hours tracking. |
| **Learning & LMS** | `/learning`<br>`/suite/learning/**` | `ess:read` | `EMPLOYEE`, `HR_MANAGER`, `TENANT_ADMIN`, `SYSTEM_ADMIN` | Corporate training courses, compliance video modules, and certification tracking. |
| **Performance Reviews** | `/performance`<br>`/suite/performance/**` | `corehr:employee:read` | `EMPLOYEE`, `HR_MANAGER`, `TENANT_ADMIN`, `SYSTEM_ADMIN` | 360-degree performance feedback, OKR goal setting, and annual review submissions. |
| **AI HR Copilot** | `/ai-copilot`<br>`/suite/ai-copilot/**` | `corehr:employee:read` | `EMPLOYEE`, `HR_MANAGER`, `TENANT_ADMIN`, `SYSTEM_ADMIN` | Automated NLP HR assistant for policy Q&A, leave balance inquiries, and quick actions. |

---

## 3. Enforcement Mechanism (`PermissionAspect.java`)

1. **Authentication Token Extraction**: The `JwtAuthenticationFilter` inspects incoming `Authorization: Bearer <token>` headers.
2. **Authority Mapping**: Extracted roles (e.g., `ROLE_ADMIN`, `ROLE_EMPLOYEE`) are loaded into `SecurityContextHolder.getContext().getAuthentication().getAuthorities()`.
3. **Aspect Interception**: Any controller method annotated with `@HasPermission("permission:name")` triggers `PermissionAspect.checkPermission()`.
4. **Admin Override Rule**: If the authenticated principal possesses `ROLE_ADMIN`, `ROLE_SYSTEM_ADMIN`, or `ROLE_TENANT_ADMIN`, access is automatically granted without database lookup.
## 4. Role-Specific Dashboard Display & Component Breakdown

Depending on the authenticated user's role, the system renders specialized dashboard layouts and widget stats:

### 👑 1. SaaS Super Admin Dashboard (`SYSTEM_ADMIN`)
* **Badge Header**: `👑 SAAS PRODUCT OWNER`
* **Key Metric Widgets**:
  * **Active Platform Tenants**: Real-time count of active enterprise tenant organizations in PostgreSQL.
  * **Global DB Connection Pools**: HikariCP dynamic multi-tenant connection status.
  * **Platform Infrastructure Status**: Live operational status of Redis, PostgreSQL, and Spring Boot backend.
  * **Security & Audit Ledger**: Global breach & security incident status.
* **Featured Widgets**:
  * **SaaS Product Owner Actions**: Quick links to **Provision New Enterprise Tenant**, **SaaS Tenant Analytics**, and **Global Audit Ledger**.
  * **Dynamic Routing Engine Status**: Live status of HikariCP DataSource Router, Redis Cache connection, and Flyway migration versions.

---

### 🏢 2. Tenant Admin & HR Manager Dashboard (`TENANT_ADMIN` / `HR_MANAGER`)
* **Badge Header**: `🏢 TENANT ADMINISTRATOR` / `👔 HR DEPARTMENT MANAGER`
* **Key Metric Widgets**:
  * **Legal Entities Count**: Number of registered legal company entities.
  * **Cost Centers Count**: Financial cost center count within the organization.
  * **Departments Count**: Active department count (Engineering, Operations, HR, Sales, etc.).
  * **Teams Count**: Operational teams working under departments.
* **Featured Widgets**:
  * **Company Administration Actions**: Quick links to **Manage Org Chart**, **Run Payroll Engine**, and **Workspace White-labeling**.

---

### 👤 3. Employee Self-Service Dashboard (`EMPLOYEE`)
* **Badge Header**: `👤 EMPLOYEE ESS PORTAL`
* **Key Metric Widgets**:
  * **Vacation Allowance**: Available paid time off and vacation days balance.
  * **Shift Schedule**: Active shift assignment (e.g., Morning 09:00 - 17:00).
  * **Pending Approvals**: Status of submitted leave, expense, or shift swap requests.
  * **Performance Rating**: Annual OKR performance score percentage.
* **Featured Widgets**:
  * **Employee Quick Actions**: Quick links to **View My ESS Profile**, **Request Vacation Leave**, and **LMS Learning Courses**.

