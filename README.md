# Awais HR Engine — Enterprise SaaS Multi-Tenant Platform

Awais HR is a state-of-the-art, high-performance, enterprise-grade SaaS Human Resource Management System (HRMS) built using a **Modular Monolith** architecture with a **Database-per-Tenant** isolation strategy. 

The platform supports 40 fully-integrated functional phases ranging from core onboarding and payroll processing to succession planning, ATS, shift calendars, asset management, and AI anomaly detection.

---

## 🛠️ Tech Stack

### Backend
- **Core Engine:** Spring Boot 3.3.1 (Java 21 LTS)
- **Security:** Spring Security (Stateless JWT Authentication)
- **Database Access:** Spring JDBC Template (Optimized raw SQL queries avoiding heavy Hibernate ORM overhead where speed is critical)
- **Database Migrations:** Flyway (Supports dual-schema separation: Master metadata schema + dynamic per-tenant schemas)
- **Aspects (AOP):** AspectJ for declarative permission-gating (`@HasPermission`) and RLS tenant routing.

### Frontend
- **Framework:** Next.js 16 (App Router) / React 19
- **Styling:** TailwindCSS v4
- **HTTP Client:** Custom Fetch Wrapper with token & tenant header injection interceptors

### Infrastructure, Database & Cache
- **Database:** PostgreSQL 16
- **Cache Engine:** Redis 7 (Configured with dynamic key prefixing for multi-tenant cache isolation)
- **Containerization:** Docker & Docker Compose (Multi-stage optimized builds)

---

## 🏛️ Architecture & Core Principles

```
┌────────────────────────────────────────────────────────┐
│               Client browser / Mobile PWA              │
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
       │ Cache Miss              │ Dynamic DB connection
       ▼                         ▼
┌──────────────┐          ┌──────────────────────────────┐
│  Redis Cache │          │      PostgreSQL Cluster       │
│  (7-alpine)  │          ├──────────────┬───────────────┤
│  Port 6379   │          │  Master DB   │ Tenant DB(s)  │
│  TTL: 10 min │          │(awais_master)│(awais_<slug>) │
│  Tenant-keyed│          └──────────────┴───────────────┘
└──────────────┘
```

### 1. Database-Per-Tenant Isolation
When a new organization registers:
1. The backend automatically creates a new physical database in PostgreSQL (e.g. `awais_hr_tenant_acme`).
2. Flyway dynamically migrates the new database to the latest schema using migration scripts.
3. Default roles (`EMPLOYEE`, `MANAGER`, `HR_MANAGER`) are seeded.
4. Incoming API requests are parsed for the `X-Tenant` header or the URL subdomain context. The `TenantRoutingDataSource` routes the connection pool dynamically to that tenant's database context.

### 2. Modular Monolith Design
The code is divided into 40 distinct business domains inside `com.awais.hr.module`. Each module maintains its own controllers, services, database tables, and tests:
- `auth`, `tenant`, `org`, `employee` (Core Context)
- `attendance`, `leave`, `shifts`, `holidays` (Workforce Control)
- `payroll`, `expense`, `travel`, `benefits`, `compensation` (Financials Suite)
- `recruitment`, `onboarding`, `offboarding`, `contractor` (Talent lifecycle)
- `assets`, `learning`, `performance`, `workflow`, `ai` (Enterprise opserations)

---

## 🚀 How to Run the Project

### Option 1: Using Docker (Recommended — Single Command)
The entire project (Postgres DB, Redis cache, Spring Boot backend, and Next.js frontend) is dockerized with optimized multi-stage images.

1. Ensure **Docker** and **Docker Compose** are installed and running.
2. In the root directory of the project, run:
   ```bash
   docker-compose up --build
   ```
3. This command will:
   - Compile the Spring Boot engine from source using Java 21 JRE.
   - Build the Next.js production bundles.
   - Launch PostgreSQL on port `5432` and initialize the master database `awais_hr_master`.
   - Spin up Redis server on port `6379`.
   - Start the backend on port `8080`.
   - Start the frontend on port `3000`.
4. Access the application at **`http://localhost:3000`**.

### Option 2: Running Locally for Development

#### Prerequisites
- Java 21 JDK
- Maven 3.9+
- Node.js 20+ & npm

#### Step 1: Configure Database
1. Run a local PostgreSQL instance.
2. Create a database named `awais_hr_master`.
3. Configure `backend/src/main/resources/application.properties` with your local database credentials (e.g., username/password).

#### Step 2: Run Using Helper Script
We provide a helper shell script that stops any blocking ports and launches both servers in separate terminal windows (or as background threads if no graphical environment is detected):

```bash
./run.sh
```

---

## 📂 Project Structure

```text
Human-resource-managemnet/
├── backend/
│   ├── src/main/java/com/awais/hr/
│   │   ├── config/              # Security and DB routing configs
│   │   ├── common/              # API payload wraps (ApiResponse)
│   │   └── module/              # 40 business modules
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   │   ├── master/          # Tenant database registry schema
│   │   │   └── tenant/core/     # Core HRMS tenant schemas (V1 to V16)
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js Pages router (dashboard, ess, suite, etc.)
│   │   ├── services/            # Axios API wrappers (api.js, suiteService.js, etc.)
│   │   └── modules/             # JSX components and styling systems
│   ├── Dockerfile
│   └── package.json
│
├── docs/                        # Complete technical specification and product backlogs
├── docker-compose.yml           # Multi-container orchestration
└── run.sh                       # Local helper script
```

---

## 🔒 Security & Authorization

Declarative access control is implemented using custom annotation-driven aspects:
```java
@PostMapping("/positions")
@HasPermission("MANAGE_ORGANIZATION")
public ApiResponse<String> addPosition(@RequestBody Map<String, Object> body) {
    successionService.addPosition(body);
    return ApiResponse.success("Position added.");
}
```
Every endpoint maps permissions like `MANAGE_PAYROLL`, `VIEW_TIMELINE`, or `MANAGE_ORGANIZATION` dynamically checking against the active tenant DB user configuration on request.
