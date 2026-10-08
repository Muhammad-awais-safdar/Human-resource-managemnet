# 🔑 Awais HR Enterprise SaaS - Access URLs & Seeded Login Credentials

## 🌐 Application Portals & Endpoints

| Portal / Service | Target Audience / Function | Access URL | Default Credentials / Notes |
| :--- | :--- | :--- | :--- |
| **Platform Web App** | Base Tenant Portal & Employee Access | [http://localhost:3000/login](http://localhost:3000/login) | Standard User Login |
| **Workspace Subdomain** | Dedicated Tenant Workspace (`awais`) | [http://awais.localhost:3000/login](http://awais.localhost:3000/login) | Tenant Specific Login |
| **Backend REST API** | Spring Boot API Base Context | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) | Swagger / Actuator |
| **Grafana Portal** | SRE Observability & Telemetry Dashboards | [http://localhost:3001](http://localhost:3001) | `admin` / `admin` |
| **Prometheus Engine** | System Metrics Collection | [http://localhost:9090](http://localhost:9090) | Open Metrics Endpoint |

---

## 🔐 Platform & Workspace Seeded Accounts

### 👑 Platform Super Administrators (Base Domain: `localhost:3000`)

| Assigned Role | User Name | Email Address | Default Password | Testing MFA Code |
| :--- | :--- | :--- | :--- | :--- |
| **SaaS Product Owner** | System Administrator | `admin@awais.com` | `admin123` | `123456` |
| **Platform Support** | Platform Support Lead | `support@platform.com` | `admin123` | `123456` |

---

### 🏢 Tenant Workspace Accounts (Subdomain / Tenant: `awais`)

| # | Assigned Role | User Name | Email Address | Default Password | Testing MFA Code |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Tenant Administrator** | Workspace Admin | `tenant.admin@awais.com` | `password123` | `123456` |
| **2** | **HR Manager** | Sarah Connor | `hr.manager@awais.com` | `password123` | `123456` |
| **3** | **Line Manager** | Michael Scott | `line.manager@awais.com` | `password123` | `123456` |
| **4** | **Finance Admin** | Oscar Martinez | `finance.admin@awais.com` | `password123` | `123456` |
| **5** | **Recruiter** | Pam Beesly | `recruiter@awais.com` | `password123` | `123456` |
| **6** | **Auditor** | Angela Martin | `auditor@awais.com` | `password123` | `123456` |
| **7** | **Employee** | John Doe | `employee.john@awais.com` | `password123` | `123456` |
| **8** | **Employee** | Jane Smith | `employee.jane@awais.com` | `password123` | `123456` |

---

## ⚡ MFA Verification & OTP Methods

During login testing, complete two-factor authentication using any of the following 3 options:

1. **Universal Testing Bypass Code**: Enter **`123456`** directly on the MFA verification prompt.
2. **Backend Application Logs**: Check live logs in terminal or Docker:
   ```bash
   docker logs awais-hr-backend | grep "Verification code issued"
   ```
3. **Database Query**: Query the database table directly:
   ```bash
   docker exec -it awais-hr-db psql -U postgres -d awais_hr_master -c "SELECT email, code, expires_at FROM mfa_code ORDER BY created_at DESC LIMIT 5;"
   ```

---

## 🛠️ Step-by-Step Access Instructions

1. **Launch Environment**: Run `./run.sh` to start PostgreSQL, Redis, Backend (`http://localhost:8080`), and Frontend (`http://localhost:3000`).
2. **Open Login Screen**: Open [http://localhost:3000/login](http://localhost:3000/login) in your browser.
3. **Authenticate**: Enter any email and password from the tables above (e.g. `admin@awais.com` / `admin123` or `tenant.admin@awais.com` / `password123`).
4. **MFA Verification**: Enter `123456` on the MFA prompt.
5. **Role Dashboard**: You will automatically be routed to `/dashboard` with your active role permissions and custom workspace header.
