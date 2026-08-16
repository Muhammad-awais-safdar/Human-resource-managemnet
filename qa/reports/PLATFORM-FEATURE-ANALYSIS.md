# Awais HR Multi-Tenant Enterprise SaaS Platform — Deep Architectural & Feature Inventory Analysis

## Executive Summary

The **Awais HR SaaS Platform** is an enterprise-grade, multi-tenant Human Resource Management System built with **Java / Spring Boot 3.x** (Hexagonal/DDD Architecture) on the backend and **Next.js / React** on the frontend. The platform features **66 backend Java modules**, **433 REST API endpoints**, **12 specialized industry vertical capability packs**, **AOP-driven Role-Based Access Control (RBAC)**, **Maker-Checker financial dual control**, and **full multi-tenant data isolation**.

---

## 🏛️ Core Platform Pillars & Feature Breakdown

### 1. Multi-Tenancy & Platform Architecture Engine
- **Tenant Context Resolution**: Dynamic database context switching per request via `X-Tenant-ID` header or subdomain resolution.
- **Dynamic Industry Capability Pack Provisioning**: Real-time feature toggle switching per tenant via `PUT /tenants/current/industry`.
- **Subdomain & Custom Domain Routing**: Vanity domain lookup (`GET /tenants/public/lookup/{subdomain}`) and tenant branding customizer (logos, colors).
- **Tenant Self-Registration Wizard**: Automated tenant onboarding, database context bootstrapping, and admin account provisioning (`POST /tenants/register`).

---

### 2. Core Human Resource Management (Core HR)
- **Employee Lifecycle Management**: Onboarding, probation tracking, role assignment, timeline events, and clearance offboarding (`/employee/list`, `/employee/timeline`, `/employee/clearance`).
- **360-Degree Employee Profile**: Unified view of employee personal info, performance notes, asset assignments, manager reviews, and document attachments (`/suite/employee-360`).
- **Organizational Hierarchy & Department Tree**: Interactive Department Unit tree visualizer (`GET /org/tree`) and parent-child org unit management (`/org`).
- **Contractor & Contingent Workforce**: Agreement management, contractor profiles, and timesheet approvals (`/contractor/contractors`).

---

### 3. Specialized Industry Vertical Modules (12 Capability Packs)

| Vertical Pack | Industry Target | Unique Capabilities & Endpoints |
|:---|:---|:---|
| 🏥 **Healthcare & Clinical** | Hospitals, Clinics, Elder Care | Clinical shift rosters, HIPAA compliance audit trails, medical license tracking, credential verifications (`/verticals/healthcare`) |
| 🏨 **Hospitality & Restaurant** | Hotels, Restaurants, Catering | Tip pooling algorithms, shift bidding, POS integration, banquet server scheduling (`/api/v1/hospitality`) |
| 🏦 **BFSI** | Banks, Financial Institutions | Mandatory Block Leave enforcement, ISO 20022 XML disbursement formatting, Maker-Checker dual control (`/api/v1/bfsi`) |
| 🌾 **AgriTech** | Agriculture, Commercial Farms | Harvest log logging, piece-rate calculation with high-precision `BigDecimal` math (`/api/v1/agritech`) |
| 🛍️ **Retail & Omnichannel** | Supermarkets, Retail Chains | POS commissions calculation, floor shift bidding, sales commission distribution (`/api/v1/retail`) |
| 💻 **IT & Software Services** | Tech Agencies, Software Houses | Dev worklogs, equity grants (ESOPs), billable utilization analytics (`/verticals/it-services`) |
| 🏗️ **Construction** | Engineering, Civil Infrastructure | Weather check API, automated site gate pass generation, safety compliance (`/api/v1/construction`) |
| ⚙️ **Manufacturing** | Factories, Assembly Lines | Machinery preventive maintenance scheduling, piece-rate wage calculation (`/api/v1/manufacturing`) |
| 🚚 **Logistics** | Fleet & Logistics Operations | Driver hours validation (DOT/FMCSA compliance), telematics GPS attendance sync, distance allowances (`/api/v1/logistics`) |
| 💼 **Consulting** | Advisory, Management Firms | Profit-sharing calculations, project utilization analytics (`/api/v1/consulting`) |
| 🎓 **Education** | Schools, Universities | Lecture credit calculation, faculty tenure reviews (`/api/v1/education`) |
| 🏭 **Heavy Equipment** | Plant & Machinery | Maintenance task scheduling and work order tracking (`/api/v1/manufacturing/machinery`) |

---

### 4. Financial Governance, Payroll & Maker-Checker Dual Control
- **Automated Payroll Engine**: Multi-component salary calculations, tax deductions, payslip generation (`/suite/payroll/run`, `/suite/payroll/payslips`).
- **Bank Payroll & NACHA/ISO Exports**: Batch bank payroll exports for SEPA, NACHA, and ISO 20022 XML formats (`/suite/bank-payroll/batches`).
- **Maker-Checker Dual Control**: Mandatory dual-approval enforcement on financial disbursements (`/suite/payroll-disbursement`).
- **Expense Claim Management**: Claim submission, receipt attachment, approval routing, and reimbursement (`/suite/expense/claims`).
- **Compensation & Salary Bands**: Salary band definitions and compensation review workflows (`/compensation/bands`, `/compensation/reviews`).

---

### 5. Security, RBAC & Identity Governance
- **AOP Permission System**: Custom annotations (`@PreAuthorize`, `@RequiresPermission`) enforcing granular action rights (`corehr:employee:read`, `payroll:process`, etc.).
- **Fine-Grained Role Management**: Custom role creation, permission matrix binding, and role cloning (`/roles`, `/roles/clone`, `/roles/user-effective`).
- **Authentication & MFA**: JWT token generation with expiration, refresh tokens, and Multi-Factor Authentication (`/auth/login`, `/auth/mfa/verify`).
- **Single Sign-On (SSO)**: SAML 2.0 & OAuth2 / OpenID Connect SSO integration configuration (`/suite/sso/config`).
- **Support Impersonation**: Secure support agent impersonation with audit trails (`/api/v1/platform/support/impersonate`).

---

### 6. Workforce, Attendance & Leave Management
- **Biometric & Mobile Check-in/out**: Geofenced mobile punches and biometric webhook integration (`/attendance/checkin`, `/webhooks/biometric`).
- **Leave Request & Accrual Engine**: Multi-policy leave management, balance tracking, and status update workflows (`/leaves/policies`, `/leaves/requests`).
- **Workforce Scheduling & Shift Bidding**: Open shift creation, shift swap requests, and employee bidding (`/workforce/schedules`, `/suite/shifts/swap`).
- **Overtime & Holiday Rules**: Regional holiday calendars and automatic overtime multiplier calculation (`/suite/holidays`).

---

### 7. Recruitment, Talent Acquisition & AI Automation
- **Applicant Tracking System (ATS)**: Job posting management, candidate pipeline stages, and application submission (`/recruitment/jobs`, `/recruitment/candidates`).
- **Interview & Offer Management**: Interview scheduling and formal offer letter generation (`/suite/recruitment-ext/interviews`, `/suite/recruitment-ext/offers`).
- **AI Automation & Copilot**: Candidate fit scoring, attrition risk prediction, anomaly detection, and AI Copilot assistant (`/suite/ai/anomalies`, `/suite/ai-copilot/ask`).

---

### 8. Performance, LMS & Employee Engagement
- **Goal Tracking & Peer Feedback**: OKR/Goal management and 360 peer feedback submissions (`/suite/performance/goals`, `/suite/performance/peer-feedback`).
- **LMS (Learning Management System)**: Course creation, enrollment, quiz management, and certificate tracking (`/suite/learning/courses`, `/suite/learning/quizzes`).
- **Employee Engagement & Recognition**: Pulse surveys, peer recognitions, and suggestion box (`/suite/engagement/surveys`, `/suite/engagement/recognitions`).
- **Career Pathways & Mentorship**: Career plan tracking and mentor-mentee pairing (`/suite/career-development/paths`, `/suite/career-development/mentorship`).

---

### 9. Operations, Observability & Developer Ecosystem
- **Observability & Log Streaming**: Real-time log tailing, security event monitoring, and exception tracking (`/suite/observability/logs`, `/suite/observability/security-events`).
- **Audit Center & Compliance Purge**: Immutable audit logs and GDPR/HIPAA data consent & purge tools (`/suite/audit-center/logs`, `/suite/compliance/purge`).
- **Developer Platform & Webhooks**: Custom webhook registration, API marketplace keys, and developer documentation (`/suite/developer-platform/webhooks`, `/suite/api-marketplace/keys`).
- **Platform Super Admin Portal**: Global tenant health deep dive, subscription extension, and plan management (`/suite/superadmin/tenants/deep-dive`, `/suite/superadmin/plans`).
- **Business Continuity & Backups**: Automated tenant backup generation and disaster recovery status (`/suite/business-continuity/backups`).

---

## 📊 Summary Statistics

| Metric | System Total |
|:---|:---|
| **Backend Java Modules** | **66 Modules** |
| **Cataloged API Endpoints** | **433 Endpoints** |
| **Industry Capability Packs** | **12 Industry Verticals** |
| **Automated QA Test Matrix** | **33 Automated Tests (100% Pass)** |
| **RBAC Security Permutations** | **3,448 Permutations** |
