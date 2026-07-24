# Awais HR Engine — Enterprise SaaS Multi-Tenant Platform

Awais HR is a state-of-the-art, high-performance, enterprise-grade SaaS Human Resource Management System (HRMS) built using a **Modular Monolith** architecture with a **Database-per-Tenant** isolation strategy. 

The platform supports 64 fully-integrated functional phases ranging from core onboarding, HR analytics, and automated multi-currency payroll processing to succession planning, ATS, shift calendars, asset management, AI resume parsing, and an **Enterprise Payment Integration Framework**.

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

## 🔐 Repository Privileges & Role-Based Access Control (RBAC)

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
| **👑 Super Admin** | `SUPER_ADMIN` | Master DB tenant provisioning, global subscription plan creation, platform pricing control (`/superadmin/pricing-plans`), system health & audit monitoring. |
| **🏢 Tenant Admin** | `MANAGE_TENANT_SETTINGS`, `MANAGE_PAYROLL` | Self-service subscription upgrades (`/settings/billing`), seat add-ons, payroll batch creation, MFA salary disbursement execution, bank gateway configuration. |
| **👥 HR Manager** | `MANAGE_EMPLOYEE`, `MANAGE_LEAVE`, `MANAGE_ATTENDANCE` | Employee onboarding, shift assignments, leave approvals, recruitment job postings, performance appraisals. |
| **🧑‍💻 Employee (ESS)** | `VIEW_ESS`, `SUBMIT_LEAVE`, `SUBMIT_EXPENSE` | Self-service profile, clock-in/out, leave requests, expense reimbursements, payslip downloads. |

---

## 🛠️ Tech Stack

### Backend
- **Core Engine:** Spring Boot 3.3.1 (Java 21 LTS)
- **Security:** Spring Security (Stateless JWT Authentication)
- **Database Access:** Spring JDBC Template (Optimized raw SQL queries avoiding heavy ORM overhead where speed is critical)
- **Database Migrations:** Flyway (Master metadata schema + dynamic per-tenant schema migrations V1 to V50)
- **Aspects (AOP):** AspectJ for declarative permission-gating (`@HasPermission`) and RLS tenant routing.

### Frontend
- **Framework:** Next.js 16 (App Router) / React 19
- **Styling:** Vanilla CSS & TailwindCSS v4
- **HTTP Client:** Custom Fetch Wrapper with automatic Bearer JWT & `X-Tenant` header injection interceptors.

### Infrastructure, Database & Cache
- **Database:** PostgreSQL 16
- **Cache Engine:** Redis 7 (Configured with dynamic key prefixing for multi-tenant cache isolation)
- **Containerization:** Docker & Docker Compose (Multi-stage optimized builds)

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
└──────┬─────────────────────────┬───────────────────────┘
       │ Cache Miss              │ Dynamic DB Connection
       ▼                         ▼
┌──────────────┐          ┌──────────────────────────────┐
│  Redis Cache │          │      PostgreSQL Cluster       │
│  (7-alpine)  │          ├──────────────┬───────────────┤
│  Port 6379   │          │  Master DB   │ Tenant DB(s)  │
│  TTL: 10 min │          │(awais_master)│(awais_<slug>) │
│  Tenant-keyed│          └──────────────┴───────────────┘
└──────────────┘
```

---

## 🚀 How to Run the Project

### Option 1: Using Docker (Recommended — Single Command)
```bash
docker-compose up --build
```
1. Builds the Spring Boot backend JAR artifact using Java 21 JRE.
2. Builds the Next.js production bundle.
3. Launches PostgreSQL (`5432`) and Redis (`6379`).
4. Access the application at **`http://localhost:3000`**.

### Option 2: Running Locally for Development
```bash
./run.sh
```

---

## ⚡ Stress Testing & Capacity Benchmarking (`scripts/stress_test.py`)

The platform includes a custom multi-threaded Python stress-testing suite [`scripts/stress_test.py`](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/scripts/stress_test.py) to measure backend throughput, latencies, response status codes, and P95/P99 metrics under concurrent tenant load.

### How to Run Stress Tests

#### Prerequisites
- Python 3.8+ (No external third-party library installations required; relies on Python standard libraries).

#### Command Syntax
```bash
python3 scripts/stress_test.py [CONCURRENCY_THREADS] [TOTAL_REQUESTS]
```

#### Execution Examples

1. **Quick Smoke Test (20 Concurrent Threads, 200 Total Requests)**:
   ```bash
   python3 scripts/stress_test.py 20 200
   ```

2. **Medium Workload Test (50 Concurrent Threads, 1,000 Total Requests)**:
   ```bash
   python3 scripts/stress_test.py 50 1000
   ```

3. **Heavy Enterprise Load Test (100 Concurrent Threads, 5,000 Total Requests)**:
   ```bash
   python3 scripts/stress_test.py 100 5000
   ```

#### Output Metrics Provided
- **Total Execution Time (Seconds)**
- **Throughput (Requests Per Second — RPS)**
- **Average Latency (ms)**
- **Min / Max Latency (ms)**
- **Percentile Benchmarks**: P50 (Median), P95, and P99 latency percentiles
- **HTTP Status Code Breakdown & Success/Failure Rates**

---

## 📂 Project Structure

```text
Human-resource-managemnet/
├── backend/
│   ├── src/main/java/com/awais/hr/
│   │   ├── config/              # Security, AOP Aspect, and DB routing configs
│   │   ├── context/             # TenantContextHolder & TenantResolutionFilter
│   │   ├── common/              # API payload wraps (ApiResponse)
│   │   └── module/              # 64 business modules (billing, bankpayroll, etc.)
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   │   ├── master/          # Tenant database registry schema
│   │   │   └── tenant/core/     # Core HRMS tenant schemas (V1 to V50)
│   │   └── application.properties
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
