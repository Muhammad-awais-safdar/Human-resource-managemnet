# Awais HR Engine — Enterprise SaaS Multi-Tenant Platform

Awais HR is a state-of-the-art, high-performance, enterprise-grade SaaS Human Resource Management System (HRMS) built using a **Modular Monolith** architecture with a **Database-per-Tenant** isolation strategy. 

The platform supports 65 fully-integrated functional modules ranging from core onboarding, HR analytics, and automated multi-currency payroll processing to succession planning, ATS, shift calendars, asset management, AI resume parsing, an **Enterprise Payment Integration Framework**, and a full-stack **Enterprise Observability & Telemetry Suite**.

---

## 🚀 Complete Platform Infrastructure & Service Endpoints

| Service Module | Technology Stack | Access URL / Port | Container Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web App** | Next.js 16 (App Router) / React 19 | [http://localhost:3000](http://localhost:3000) | `awais-hr-frontend` | 🟢 **Operational** |
| **Backend REST API** | Spring Boot 3.3.1 (Java 21 LTS) | [http://localhost:8080](http://localhost:8080) | `awais-hr-backend` | 🟢 **Operational** |
| **Grafana Enterprise** | Grafana 10.4 | [http://localhost:3001](http://localhost:3001) | `awais-hr-grafana` | 🟢 **Operational** |
| **Prometheus Metrics** | Prometheus 2.51 | [http://localhost:9090](http://localhost:9090) | `awais-hr-prometheus` | 🟢 **Operational** |
| **Loki Centralized Logs** | Grafana Loki 2.9.4 | `http://localhost:3100` | `awais-hr-loki` | 🟢 **Operational** |
| **Promtail Log Shipper** | Grafana Promtail 3.0.0 | Internal Service | `awais-hr-promtail` | 🟢 **Operational** |
| **Tempo Distributed Tracing**| Grafana Tempo 2.4 | `http://localhost:3200` | `awais-hr-tempo` | 🟢 **Operational** |
| **Alertmanager** | Prometheus Alertmanager 0.27 | [http://localhost:9093](http://localhost:9093) | `awais-hr-alertmanager` | 🟢 **Operational** |
| **PostgreSQL Database** | PostgreSQL 16 (Master + Tenant DBs) | `localhost:5432` | `awais-hr-db` | 🟢 **Healthy** |
| **Redis Cache Engine** | Redis 7 (Tenant-prefixed keys) | `localhost:6379` | `awais-hr-redis` | 🟢 **Healthy** |

---

## 🌐 Full-Stack Enterprise Observability Platform

The platform includes an integrated **Observability & Operational Telemetry Suite** accessible directly from the Super Admin Portal (`/superadmin/observability`) as well as Grafana:

### 1. Dual-Persona Telemetry UI
* 👔 **Executive View**: High-level business growth metrics, MRR/ARR, tenant seat counts, system uptime, and explanatory cards for non-technical stakeholders.
* 💻 **SRE & Technical Deep-Dive**: Real-time server log streaming (`tail -f`), audit trails, exception stack trace viewer, and active incident alerting rule configurations.

### 2. 8 Provisioned Enterprise Grafana Dashboards
1. **01 - Infrastructure & Docker Overview**: Host CPU, Memory, Disk I/O, Network, and cAdvisor container metrics.
2. **02 - JVM & Spring Boot Metrics**: Heap memory, metaspace, GC pause durations, and active thread counts.
3. **03 - PostgreSQL Database Overview**: DB connection pools, transactions per second (TPS), lock contention, and HikariCP acquire latency.
4. **04 - Redis Cache Performance**: Memory usage, commands/sec, cache hit/miss ratio, and evicted keys.
5. **05 - API Requests, Latency & Error Rate**: RPS, P50/P95/P99 latency histograms, and HTTP 4xx/5xx error rates.
6. **06 - Executive Business KPIs & Financial Metrics**: Active tenant metrics, MRR, ARR, employee seat usage, and payroll run success rate.
7. **07 - Multi-Tenant Operations & Resource Usage**: Per-tenant CPU usage, API traffic, storage consumption, and tenant activity.
8. **08 - Developer Deep-Dive & Live Server Logs**: Live Loki container log stream, slow SQL query traces (>500ms), and OpenTelemetry traces.

---

## 💳 Enterprise Payment Integration Framework

The platform includes a provider-agnostic, dual-domain payment architecture supporting **both Worldwide International Tenants and Pakistan Local Tenants**:

### 1. SaaS Subscription Billing Engine (Payment Domain 1)
* **Dynamic Per-Seat Add-on Seat Calculation**: Base plan price + extra seat overage calculation (`Base Price + (Requested Seats - Included Seats) * PerSeatRate`).
* **Seeded Market-Leading Tiers**:
  * **STARTER** ($49/mo base, 15 included seats, $4/seat add-on, 25 GB storage)
  * **GROWTH PROFESSIONAL** ($199/mo base, 50 included seats, $7/seat add-on, 100 GB storage)
  * **ENTERPRISE SUITE** ($499/mo base, 100 included seats, $10/seat add-on, 500 GB storage)
* **Supported Gateways**:
  * 🌍 **Worldwide**: Stripe, Paddle (Merchant of Record), Lemon Squeezy, PayPal.
  * 🇵🇰 **Pakistan Local**: JazzCash Mobile Wallet/Cards, EasyPaisa OTC/Wallet, State Bank Raast / 1-Link.

### 2. Payroll Salary Disbursement Engine (Payment Domain 2)
* **Non-Custodial Batch Payout Pipeline**: AES-256-GCM encrypted tenant credential storage with MFA verification code requirements and `X-Idempotency-Key` headers.
* **Supported Disbursement Networks**:
  * 🌍 **Worldwide**: Wise Business Batch API (50+ currencies), Payoneer, US NACHA ACH Direct Deposit.
  * 🇵🇰 **Pakistan Local**: State Bank Raast Instant IBAN-to-IBAN Transfer, Habib Bank Limited (HBL) Corporate Direct Clearance.

---

## 🔐 Role-Based Access Control (RBAC) & Security

Access control across backend endpoints and frontend views is enforced via custom annotation-driven aspects (`@HasPermission`) and JWT tenant context tokens:

```java
@PostMapping("/plans")
@HasPermission("SUPER_ADMIN")
public ApiResponse<Map<String, Object>> savePlan(@RequestBody Map<String, Object> body) {
    return ApiResponse.success(paymentGatewayService.saveOrUpdatePlan(body));
}
```

### Privileges & Role Hierarchy

| Role Tier | Required Permission | Access Privileges & Functional Boundaries |
| :--- | :--- | :--- |
| **👑 Super Admin** | `SUPER_ADMIN` | Master DB tenant provisioning, global pricing control, system health monitoring, live log stream access, alert configuration. |
| **🏢 Tenant Admin** | `MANAGE_TENANT_SETTINGS`, `MANAGE_PAYROLL` | Self-service subscription upgrades, seat add-ons, payroll batch execution, bank gateway configuration. |
| **👥 HR Manager** | `MANAGE_EMPLOYEE`, `MANAGE_LEAVE`, `MANAGE_ATTENDANCE` | Employee onboarding, shift assignments, leave approvals, recruitment job postings, performance appraisals. |
| **🧑‍💻 Employee (ESS)** | `VIEW_ESS`, `SUBMIT_LEAVE`, `SUBMIT_EXPENSE` | Self-service profile, clock-in/out, leave requests, expense reimbursements, payslip downloads. |

---

## 🛠️ Tech Stack

### Backend
- **Core Engine:** Spring Boot 3.3.1 (Java 21 LTS)
- **Security:** Spring Security (Stateless JWT Authentication)
- **Database Access:** Spring JDBC Template (Optimized raw SQL queries for speed)
- **Database Migrations:** Flyway (Master metadata schema + dynamic per-tenant schema migrations V1 to V50)
- **Aspects (AOP):** AspectJ for declarative permission-gating (`@HasPermission`) and RLS tenant routing.
- **Logging & Tracing:** Logback (Logstash JSON Encoder) + Micrometer Tracing + OpenTelemetry.

### Frontend
- **Framework:** Next.js 16 (App Router) / React 19
- **Styling:** Vanilla CSS & TailwindCSS v4
- **HTTP Client:** Custom Fetch Wrapper with automatic Bearer JWT & `X-Tenant` header injection interceptors.

### Infrastructure, Database & Observability
- **Database:** PostgreSQL 16
- **Cache Engine:** Redis 7 (Configured with dynamic key prefixing for multi-tenant cache isolation)
- **Observability:** Grafana, Prometheus, Loki, Promtail 3.0, Tempo, Alertmanager, cAdvisor, Node Exporter.
- **Containerization:** Docker & Docker Compose (Multi-stage builds)

---

## 🏛️ Architecture & Core Principles

```
┌────────────────────────────────────────────────────────┐
│               Client Browser / Mobile PWA              │
│  Subdomain (e.g. acme.localhost) maps to Tenant context│
└──────┬─────────────────────────────────────────────────┘
       │ HTTP Request + X-Tenant Header + Bearer JWT
       ▼
┌────────────────────────────────────────────────────────┐
│               Next.js Frontend Server                  │
│  Proxies API calls to backend using dynamic rewrites   │
└──────┬─────────────────────────────────────────────────┘
       │ Proxy Rewrite: /api/v1 -> http://backend:8080
       ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot Backend Engine               │
│  - Resolve X-Tenant Header -> Set TenantContextHolder  │
│  - Intercept permissions with AOP @HasPermission Aspect│
│  - Select connection from DynamicRoutingDataSource     │
│  - @Cacheable reads from Redis (tenant-prefixed keys)  │
│  - Emit Logstash JSON logs -> Ingested by Promtail/Loki│
└──────┬─────────────────────────┬───────────────────────┘
       │ Cache Miss              │ Dynamic DB Connection
       ▼                         ▼
┌──────────────┐          ┌──────────────────────────────┐
│  Redis Cache │          │      PostgreSQL Cluster       │
│  (7-alpine)  │          ├──────────────┬───────────────┤
│  Port 6379   │          │  Master DB   │ Tenant DB(s)  │
│  TTL: 10 min │          │(awais_master)│(awais_<slug>) │
└──────────────┘          └──────────────┴───────────────┘
```

---

## 🚀 Deployment & Local Execution

### Option 1: Docker Compose (Recommended)
Launch the entire platform including backend, frontend, databases, and observability stack:

```bash
docker compose up -d
```

### Option 2: Running Host Environment Locally
```bash
./run.sh
```

---

## ⚡ Stress Testing & Capacity Benchmarking (`scripts/stress_test.py`)

The platform includes a multi-threaded Python stress-testing suite to measure throughput, latencies, and percentile benchmarks under concurrent tenant load:

```bash
# Run load test with 50 concurrent threads, 1000 total requests
python3 scripts/stress_test.py 50 1000
```

---

## 📂 Project Directory Structure

```text
Human-resource-managemnet/
├── backend/
│   ├── src/main/java/com/awais/hr/
│   │   ├── config/              # Security, AOP Aspect, and DB routing configs
│   │   ├── context/             # TenantContextHolder & TenantResolutionFilter
│   │   ├── common/              # API payload wraps (ApiResponse)
│   │   └── module/              # 65 business modules (billing, observability, etc.)
│   ├── src/main/resources/
│   │   ├── db/migration/        # Dynamic per-tenant schema migrations (V1 to V50)
│   │   └── logback-spring.xml   # Logstash JSON + Console + Observability Appenders
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js Pages router (superadmin, settings/billing, etc.)
│   │   ├── services/            # Axios API wrappers (api.js, suiteService.js, etc.)
│   │   └── modules/             # JSX components and styling systems
│   ├── Dockerfile
│   └── package.json
│
├── scripts/
│   └── stress_test.py           # Multi-threaded backend stress benchmark runner
│
├── docs/                        # Specifications, QA Reports, Capacity & Stress Test Reports
├── docker-compose.yml           # Multi-container orchestration
└── run.sh                       # Local helper script
```
