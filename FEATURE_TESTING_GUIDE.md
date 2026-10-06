# 🧪 Enterprise HR SaaS — Complete Feature Testing Guide

> **Target Workspace**: E-Processing Systems (Pvt) Ltd — **OneLoad**  
> **Subdomain**: `awais`  
> **Default Staff Password**: `password123`  
> **Super Admin Password**: `admin123`  

---

## 🚀 1. Quick Start Prerequisites

### A. Start Backend Service
```bash
cd backend
mvn spring-boot:run
```
* **Backend Base URL**: `http://localhost:8080/api/v1`
* **Swagger UI Documentation**: `http://localhost:8080/swagger-ui.html`

### B. Start Frontend Application
```bash
cd frontend
npm run dev
```
* **Workspace Portal URL**: `http://awais.localhost:3000/login`
* **Platform Control Portal**: `http://localhost:3000/login`

---

## 🧪 2. Step-by-Step Feature Test Matrix

---

### 🔑 Test Suite 1: Authentication & Multi-Tenant Routing

#### **Test Case 1.1: Platform Super Admin Login**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   * **Email**: `admin@hrm.com`
   * **Password**: `admin123`
3. **Expected Result**: Successfully logs into the Global Platform Control Portal with access to tenant management and system health logs.

#### **Test Case 1.2: Tenant Workspace Login (E-Processing Systems / OneLoad)**
1. Navigate to `http://awais.localhost:3000/login`
2. Enter CEO credentials:
   * **Email**: `ceo@ep-systems.com`
   * **Password**: `password123`
3. **Expected Result**: Authenticates into tenant `awais` workspace and displays workspace dashboard with executive access.

---

### 📖 Test Suite 2: OpenAPI / Swagger Interactive API Testing

1. Open **`http://localhost:8080/swagger-ui.html`** in browser.
2. **Authorize JWT Token**:
   * Execute `POST /api/v1/auth/login` with `{"email": "hr.manager@ep-systems.com", "password": "password123"}`.
   * Copy the returned JWT token.
   * Click **Authorize** at top right of Swagger UI, enter `Bearer <YOUR_TOKEN>`, and click Authorize.
3. **Test Multi-Tenancy Header**:
   * Test `GET /api/v1/employees`.
   * Set `X-Tenant-Subdomain` header to `awais`.
4. **Expected Result**: Swagger returns `200 OK` with 22 seeded corporate employees mapped to departments and roles.

---

### 🌳 Test Suite 3: Org Chart & Department Employee Modals

1. Log in to `http://awais.localhost:3000/login` as `hr.manager@ep-systems.com` (`password123`).
2. Navigate to **Organization Chart** (`/org-chart`).
3. **Interactive Department Modals**:
   * Click on **Executive Leadership & Board**.
     * **Modal Output**: Displays Manager **Muhammad Yar Hiraj (CEO)** and team roster (`Aezaz Hussain`, `Asif Peer`, `Faizan Siddiqui`).
   * Click on **OneLoad FinTech Engineering & Architecture**.
     * **Modal Output**: Displays Manager **Asad Mahmood** and team roster (`Kamran Baig`, `Hamza Riaz`, `Bilal Ahmed`, `Sania Mirza`, `Omer Farooq`).
   * Click on **Human Resources & People Operations**.
     * **Modal Output**: Displays Manager **Toima Asghar** and team roster (`Zainab Ali`, `Ayesha Malik`, `Fatima Hassan`).
   * Click on **Finance, Interbank Settlement & Treasury**.
     * **Modal Output**: Displays Manager **Tariq Mahmood** and team roster (`Usman Ghani`, `Mubashir Hassan`).
4. **Expected Result**: Department node modal opens smoothly showing department head manager details and all assigned employees.

---

### 👥 Test Suite 4: Employee Directory & Role-Based Access Control (RBAC)

#### **Test Case 4.1: HR Manager Full Access (`hr.manager@ep-systems.com`)**
1. Log in as `hr.manager@ep-systems.com` (`password123`).
2. Navigate to **Employee Directory** (`/employee-directory` or `/employees`).
3. **Actions Allowed**: View roster, send invitation links, update employee department mappings.

#### **Test Case 4.2: Field Officer Restricted RBAC (`employee.john@ep-systems.com`)**
1. Log in as Field Officer `employee.john@ep-systems.com` (`password123`).
2. Attempt to create a new employee or trigger administrative role updates.
3. **Expected Result**: System enforces `@HasPermission("corehr:employee:write")` and displays `403 Access Forbidden` security toast notification.

---

### 🏖️ Test Suite 5: Attendance & Leave Management

1. Log in as `lead.dev@ep-systems.com` (`password123`).
2. Navigate to **Leave & Time Off** (`/leave-time`).
3. Click **Apply for Leave**:
   * Select Policy: `Annual Vacation` (Allowance: 20 days).
   * Enter Start & End dates.
   * Submit application.
4. Log out and log in as `hr.manager@ep-systems.com` (`password123`).
5. Open **Leave Approvals** tab.
6. **Expected Result**: View pending application from `Hamza Riaz` and click **Approve**. Balance updates atomically in database.

---

### 💳 Test Suite 6: Payroll Disbursement & Maker-Checker Dual Control

1. Log in as CFO `finance.admin@ep-systems.com` (`password123`).
2. Navigate to **Payroll & Disbursements** (`/payroll`).
3. View active batch request:
   * **Batch ID**: `BATCH-2026-10-01`
   * **Amount**: `PKR 450,000.00`
   * **Channel**: `RAAST_SPI`
   * **Status**: `PENDING_CHECKER_APPROVAL`
4. Log out and log in as CEO `ceo@ep-systems.com` (`password123`).
5. Open **Maker-Checker Governance Center**.
6. **Expected Result**: Click **Approve Batch**. Disbursement transitions to `APPROVED_FOR_BANK_TRANSFER`.

---

### 🎯 Test Suite 7: OneLoad FinTech Commission & Mileage Engine

1. Log in as Sales Lead `line.manager@ep-systems.com` (`password123`).
2. Navigate to **Commission & Incentives**.
3. View active FinTech rules seeded:
   * `OneLoad Merchant Acquisition Bonus` (Target: PKR 50,000 | Rate: 2.5%)
   * `Territory Transaction Volume Incentive` (Target: PKR 200,000 | Rate: 1.5%)
4. **Expected Result**: Real-time commission analytics calculate payout tiers according to field merchant onboarding activity.

---

### 💼 Test Suite 8: Recruitment & Applicant Tracking System (ATS)

1. Log in as Recruiter `recruiter@ep-systems.com` (`password123`).
2. Navigate to **Recruitment** (`/recruitment`).
3. View seeded job requisitions:
   * `Senior FinTech Backend Engineer (Java / Spring)` — Openings: 3
   * `Territory Sales Manager - Central Punjab` — Openings: 5
4. **Expected Result**: ATS dashboard displays active pipeline, candidate applications, and requisition stages.

---

## 🔑 3. Complete Seeder Credential Reference Matrix

| Employee Code | Name & Public Designation | Email Address | Password | Role Key | Target Testing Module |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SUPER-001** | Platform Super Admin | `admin@hrm.com` | `admin123` | `SYSTEM_ADMIN` | Platform Control & Multi-Tenant Engine |
| **EPS-001** | Muhammad Yar Hiraj (CEO) | `ceo@ep-systems.com` | `password123` | `TENANT_ADMIN` | Maker-Checker Approval & Org Chart |
| **EPS-002** | Aezaz Hussain (Chairman) | `chairman@ep-systems.com` | `password123` | `TENANT_ADMIN` | Governance & Executive Reports |
| **EPS-003** | Asif Peer (Board Director) | `board.asif@ep-systems.com` | `password123` | `TENANT_ADMIN` | Executive Dashboard |
| **EPS-004** | Faizan Siddiqui (Workspace Admin) | `tenant.admin@ep-systems.com` | `password123` | `TENANT_ADMIN` | Workspace Settings & Module Config |
| **EPS-005** | Toima Asghar (Group CHRO) | `hr.chro@ep-systems.com` | `password123` | `HR_MANAGER` | Workforce Management & Org Structure |
| **EPS-006** | Zainab Ali (Head of HR Ops) | `hr.manager@ep-systems.com` | `password123` | `HR_MANAGER` | Employee Directory & Leave Approval |
| **EPS-007** | Ayesha Malik (Talent Acquisition) | `recruiter@ep-systems.com` | `password123` | `RECRUITER` | ATS & Job Requisitions |
| **EPS-008** | Fatima Hassan (HR Specialist) | `hr.bp@ep-systems.com` | `password123` | `HR_MANAGER` | Engagement & Performance |
| **EPS-009** | Asad Mahmood (Engineering Dir) | `eng.director@ep-systems.com` | `password123` | `LINE_MANAGER` | Engineering Org & Team Approval |
| **EPS-010** | Kamran Baig (Principal Architect)| `architect@ep-systems.com` | `password123` | `LINE_MANAGER` | Technical Leadership & Reviews |
| **EPS-011** | Hamza Riaz (Senior Staff Lead) | `lead.dev@ep-systems.com` | `password123` | `EMPLOYEE` | Self-Service, Attendance & Leave |
| **EPS-012** | Bilal Ahmed (DevOps Lead) | `devops.lead@ep-systems.com` | `password123` | `EMPLOYEE` | Observability & Audit Logs |
| **EPS-013** | Sania Mirza (QA Automation Lead) | `qa.lead@ep-systems.com` | `password123` | `EMPLOYEE` | Quality Assurance & Test Suites |
| **EPS-014** | Omer Farooq (Product Lead) | `product.lead@ep-systems.com` | `password123` | `LINE_MANAGER` | Product Roadmap & Verticals |
| **EPS-015** | Tariq Mahmood (CFO) | `finance.admin@ep-systems.com` | `password123` | `FINANCE_ADMIN` | Payroll Execution & Bank Transfer |
| **EPS-016** | Usman Ghani (Treasury Manager) | `finance.analyst@ep-systems.com` | `password123` | `FINANCE_ADMIN` | Treasury & Settlement Reports |
| **EPS-017** | Mubashir Hassan (SBP Auditor) | `auditor@ep-systems.com` | `password123` | `AUDITOR` | Regulatory Audit Ledger |
| **EPS-018** | Usman Khan (National Sales Head)| `line.manager@ep-systems.com` | `password123` | `LINE_MANAGER` | Sales Ops & Commission Engine |
| **EPS-019** | Saad Siddiqui (Territory Lead) | `territory.central@ep-systems.com` | `password123` | `LINE_MANAGER` | Territory Merchant Acquisition |
| **EPS-020** | Faisal Shah (Territory Sales) | `territory.south@ep-systems.com` | `password123` | `EMPLOYEE` | Merchant Field Onboarding |
| **EPS-021** | Ali Raza (Field Specialist) | `employee.john@ep-systems.com` | `password123` | `EMPLOYEE` | Attendance Punch & Mileage Logs |
| **EPS-022** | Sana Sheikh (Support Lead) | `employee.jane@ep-systems.com` | `password123` | `EMPLOYEE` | Support Desk & Helpdesk Tickets |
