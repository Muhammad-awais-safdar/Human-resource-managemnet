# Awais HR Engine — Enterprise SaaS Multi-Tenant Platform

Awais HR is a state-of-the-art, high-performance, enterprise-grade SaaS Human Resource Management System (HRMS) built using a **Modular Monolith** architecture with a **Database-per-Tenant** isolation strategy. 

The platform supports 65 fully-integrated functional modules ranging from core onboarding, HR analytics, and automated multi-currency payroll processing to succession planning, ATS, shift calendars, workflow approval engines, two-person integrity (Maker-Checker), time-bound approval delegation, centralized enterprise audit logging, and a full-stack **Enterprise Observability & Telemetry Suite**.

> 🧪 **FEATURE & TESTING ARCHITECTURE GUIDES**:  
> • Master Workflow Architecture: [ENTERPRISE_WORKFLOW_ARCHITECTURE.md](docs/ENTERPRISE_WORKFLOW_ARCHITECTURE.md)  
> • Feature Testing Matrix: [FEATURE_TESTING_GUIDE.md](FEATURE_TESTING_GUIDE.md)  
> • Leave & Approval Workflow: [LEAVE_APPROVAL_WORKFLOW_GUIDE.md](LEAVE_APPROVAL_WORKFLOW_GUIDE.md)  
> • Workflow Engine Architecture: [WORKFLOW_ENGINE.md](docs/workflow/WORKFLOW_ENGINE.md)  
> • Maker-Checker & Delegation Architecture: [MAKER_CHECKER_AND_DELEGATION.md](docs/workflow/MAKER_CHECKER_AND_DELEGATION.md)  
> • Enterprise Audit Logging Architecture: [ENTERPRISE_AUDIT_LOGGING.md](docs/architecture/ENTERPRISE_AUDIT_LOGGING.md)  
> • Salary & Compensation Workflow: [SALARY_COMPENSATION_WORKFLOW.md](docs/workflow/SALARY_COMPENSATION_WORKFLOW.md)  
> • Payroll Engine Workflow: [PAYROLL_ENGINE_WORKFLOW.md](docs/workflow/PAYROLL_ENGINE_WORKFLOW.md)  
> • Expense Management Workflow: [EXPENSE_MANAGEMENT_WORKFLOW.md](docs/workflow/EXPENSE_MANAGEMENT_WORKFLOW.md)  
> • Task Management Workflow: [TASK_MANAGEMENT_WORKFLOW.md](docs/workflow/TASK_MANAGEMENT_WORKFLOW.md)  
> • Performance 360 Workflow: [PERFORMANCE_MANAGEMENT_WORKFLOW.md](docs/workflow/PERFORMANCE_MANAGEMENT_WORKFLOW.md)  
> • Recruitment ATS Workflow: [RECRUITMENT_ATS_WORKFLOW.md](docs/workflow/RECRUITMENT_ATS_WORKFLOW.md)  
> • Onboarding / Offboarding Workflow: [ONBOARDING_OFFBOARDING_WORKFLOW.md](docs/workflow/ONBOARDING_OFFBOARDING_WORKFLOW.md)  
> • Security & SIT Testing Suite: [SECURITY_SIT_TESTING.md](docs/workflow/SECURITY_SIT_TESTING.md)

---

## 🚀 Complete Platform Infrastructure & Service Endpoints

| Service Module | Technology Stack | Access URL / Port | Container Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web App** | Next.js 14+ / React 18 | [http://localhost:3000](http://localhost:3000) | `awais-hr-frontend` | 🟢 **Operational** |
| **Backend REST API** | Spring Boot 3.3.1 (Java 21 LTS) | [http://localhost:8080](http://localhost:8080) | `awais-hr-backend` | 🟢 **Operational** |
| **Grafana Enterprise** | Grafana 10.4 | [http://localhost:3001](http://localhost:3001) | `awais-hr-grafana` | 🟢 **Operational** |
| **Prometheus Metrics** | Prometheus 2.51 | [http://localhost:9090](http://localhost:9090) | `awais-hr-prometheus` | 🟢 **Operational** |
| **Loki Centralized Logs** | Grafana Loki 2.9.4 | `http://localhost:3100` | `awais-hr-loki` | 🟢 **Operational** |
| **Promtail Log Shipper** | Grafana Promtail 3.0.0 | Internal Service | `awais-hr-promtail` | 🟢 **Operational** |
| **Tempo Distributed Tracing**| Grafana Tempo 2.4 | `http://localhost:3200` | `awais-hr-tempo` | 🟢 **Operational** |
| **Alertmanager** | Prometheus Alertmanager 0.27 | [http://localhost:9093](http://localhost:9093) | `awais-hr-alertmanager` | 🟢 **Operational** |
| **MySQL Database** | MySQL 8.0 (Master + Tenant DBs) | `localhost:3306` | `awais-hr-db` | 🟢 **Healthy** |
| **Redis Cache Engine** | Redis 7 (Tenant-prefixed keys) | `localhost:6379` | `awais-hr-redis` | 🟢 **Healthy** |

---

## 🏗️ Core Architecture & Hardening Phases

```text
User ──► Role(s) ──► Permission ──► Access Scope (SELF/TEAM/DEPARTMENT/COMPANY/GLOBAL) ──► Resource
```

- **Phases 0–4**: Architecture Audit, Security Hardening, RBAC Model, Permission Capabilities, Data Access Scopes.
- **Phase 5 (Workflow Engine)**: Core state machine engine (`V53`), dynamic approver resolution, self-approval protection.
- **Phase 6 (Maker-Checker & Delegation)**: Dual-control two-person integrity (`Maker != Checker` validation, `V54`), time-bound approval delegation.
- **Phase 7 (Enterprise Audit Logging)**: Non-sensitive compliance audit ledger (`V55`), `@Auditable` AOP aspect, `AuditSanitizer`.
- **Phase 8 (Leave Management)**: Multi-tier leave workflow state machine (`V56`).
- **Phase 9 (Employee Lifecycle)**: Employee status state machine (`V57`) & lifecycle event history ledger.
- **Phase 10 (Salary & Compensation)**: Salary revision Maker-Checker dual control & snapshot history ledger (`V58`).
- **Phase 11 (Payroll Engine)**: Payroll state machine, period locking, exact decimal arithmetic & payslip snapshot ledger (`V59`).
- **Phase 12 (Expense Management)**: Multi-tier threshold routing & self-approval protection log (`V60`).
- **Phase 13 (Task Management)**: Task lifecycle state machine & status history audit log (`V61`).
- **Phase 14 (Performance 360)**: 360 appraisal review cycle state machine & rating scale validation (`V62`).
- **Phase 15 (Recruitment ATS)**: ATS candidate pipeline & Maker-Checker requisition dual control (`V63`).
- **Phase 16 (Onboarding / Offboarding)**: Cross-department clearance engine (IT, HR, Finance, Facilities) & lifecycle guards (`V64`).
- **Phase 17 (Frontend Authorization)**: Enhanced `usePermissions.js` hook with wildcard scope matching & `<PermissionGuard>` UI component.
- **Phase 18 (Admin RBAC UI)**: Role matrix dashboard (`/roles`), audit center (`/audit`), and approvals inbox (`/approvals`).
- **Phase 19 (Security + SIT Testing)**: Integration security test suite (`EnterpriseSecurityWorkflowSITTest.java`).
- **Phase 20 (Final Architecture & Docs Sync)**: Master documentation & README sync.

---

## 🔐 Dual-Scope Role-Based Access Control (RBAC) System

Awais HR enforces a strict **Dual-Scope RBAC Architecture** separating SaaS Product Owner operations from Tenant Workspace management:

1. **Super Admin Platform Scope (Master DB Schema)**:
   - Managed at `/superadmin/rbac`.
   - Seeded Roles: `SUPER_ADMIN`, `SUPPORT_ENGINEER`, `FINANCE_AUDITOR`, `PRODUCT_OPERATOR`.
   - Seeded Permissions: `tenant:create`, `tenant:suspend`, `module:feature_flag:edit`, `observability:view`, `audit:export`, `billing:override`, `platform:rbac:manage`, `impersonate:tenant`.

2. **Tenant Workspace Scope (Tenant DB Schema)**:
   - Managed at `/roles`.
   - Seeded Roles: `TENANT_ADMIN`, `HR_MANAGER`, `LINE_MANAGER`, `FINANCE_ADMIN`, `RECRUITER`, `EMPLOYEE`.
   - Custom workspace roles and granular permissions (`corehr:employee:read`, `payroll:run:execute`, `leave:approve`).

---

## 🛠️ Tech Stack

### Backend
- **Core Engine:** Spring Boot 3.3.1 (Java 21 LTS)
- **Security:** Spring Security (Stateless JWT Authentication)
- **Database Access:** Spring JDBC Template (Optimized raw SQL queries for speed)
- **Database Migrations:** Flyway (Dynamic per-tenant schema migrations V1 to V55)
- **Aspects (AOP):** AspectJ for declarative permission-gating (`@HasPermission`), RLS tenant routing, and `@Auditable` compliance logging.
- **Logging & Tracing:** Logback (Logstash JSON Encoder) + Micrometer Tracing + OpenTelemetry.

### Frontend
- **Framework:** Next.js 14+ / React 18
- **Styling:** Vanilla CSS & TailwindCSS
- **HTTP Client:** Custom Fetch Wrapper with automatic Bearer JWT & `X-Tenant` header injection interceptors.

### Infrastructure, Database & Observability
- **Database:** MySQL 8.0
- **Cache Engine:** Redis 7 (Configured with dynamic key prefixing for multi-tenant cache isolation)
- **Observability:** Grafana 10.4, Prometheus, Loki 2.9, Promtail 3.0, Tempo 2.4, Alertmanager, cAdvisor, Node Exporter, MySQL Exporter, Redis Exporter.
- **Containerization:** Docker & Docker Compose (Multi-stage builds)

---

## 🚀 Deployment & Execution

### Option 1: Docker Compose (Recommended)
Launch the entire platform including backend, frontend, database, redis, and observability stack:

```bash
docker compose up -d
```

### Option 2: Standalone Observability Launch
Launch Grafana, Loki, Prometheus, and Tempo:
```bash
cd monitoring
./start_monitoring.sh
```

### Option 3: Development Script
```bash
./run.sh
```

---

## 📂 Project Directory Structure

```text
Human-resource-managemnet/
├── README.md                            # Master GitHub Repository Overview & Architecture Guide
├── docker-compose.yml                   # Master Multi-Container Orchestration (MySQL 8, Redis 7, Backend, Frontend)
├── run.sh                               # Development Launcher & Test Suite Orchestrator
├── task.md                              # Phase Execution Status Tracker (Phases 0–7 Complete)
│
├── backend/                             # Java 21 Spring Boot Multi-Tenant Enterprise Backend
│   ├── src/main/java/com/awais/hr/
│   │   ├── config/                      # Security, Dynamic DB Routing & AOP Aspects (@HasPermission, @Auditable)
│   │   ├── context/                     # TenantContextHolder & RLS Context Resolution
│   │   ├── module/
│   │   │   ├── workflow/                # Phase 5: Dynamic State Machine Workflow Engine
│   │   │   ├── makerchecker/            # Phase 6: Maker-Checker Two-Person Integrity (Maker != Checker)
│   │   │   ├── delegation/              # Phase 6: Time-Bound Approval Delegation Service
│   │   │   └── auditcenter/             # Phase 7: Centralized Audit Logging & AuditSanitizer
│   ├── src/main/resources/
│   │   ├── db/migration/tenant/core/    # Dynamic Flyway Migrations (V1 to V55)
│   │   └── logback-spring.xml           # Structured Async JSON Log Appender for Promtail/Loki
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                            # Next.js 14+ Workspace & Administration Web Portal
│   ├── src/
│   │   ├── app/                         # App Router Pages (SuperAdmin, Settings, Workflows)
│   │   └── services/                    # Axios API Wrappers & Tenant Header Interceptors
│   ├── Dockerfile
│   └── package.json
│
├── monitoring/                          # Enterprise Observability & Telemetry Suite
│   ├── docker-compose.yml               # Grafana 10, Loki 2.9, Prometheus 2.51, Tempo 2.4, Promtail 3.0
│   ├── grafana/
│   │   ├── datasources/                 # Auto-provisioned datasources (Prometheus, Loki, Tempo)
│   │   └── dashboards/                  # 10 Provisioned Dashboards (Overview, JVM, DB, API, Loki Logs, etc.)
│   ├── promtail/                        # Low-cardinality JSON log scraping pipeline configuration
│   └── start_monitoring.sh              # Standalone monitoring launcher script
│
├── qa/                                  # SQA Pytest Automated Test Suite (Security, Tenant Isolation, RBAC)
│
├── docs/                                # Technical Architecture & Domain Documentation
│   ├── architecture/                    # Enterprise Audit Logging & RLS docs
│   └── workflow/                        # Workflow Engine & Maker-Checker docs
│
├── docker-compose.yml                   # Master multi-container orchestration
└── scripts/                             # Capacity & Performance Testing Tools
    └── stress_test.py                   # Multi-threaded backend stress benchmark script
```
