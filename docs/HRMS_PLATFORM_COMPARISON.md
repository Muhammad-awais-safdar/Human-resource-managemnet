# ⚔️ Awais HR Engine vs. Pakistan & Global HRMS Benchmark Report

> **Target Workspace**: E-Processing Systems (Pvt) Ltd — **OneLoad**  
> **Subdomain**: `awais`  

---

## 📌 Executive Summary

**Awais HR Engine** is architected as a **Dual-Domain Enterprise Modular Monolith**. It bridges the gap between **Pakistani Statutory & Payment Networks (RAAST, HBL, FBR, EOBI, PESSI/SESSI)** and **Global SaaS Capabilities (Multi-Tenant DB Isolation, Wise, Stripe, OpenTelemetry Tracing, Maker-Checker Dual Control)**—a combination that neither local legacy tools nor global platforms offer out of the box.

```
                                  GLOBAL CAPABILITY
                                         │
                                         │    🌍 Rippling / Workday
                                         │    (High global features, zero
                                         │     Pakistan SBP/FBR compliance)
                                         │
                        ⚡ AWAIS HR ENGINE
                        (Dual Domain: 
                         Pakistan RAAST/FBR + 
                         Global Wise/Stripe + 
                         DB-per-Tenant Isolation)
                                         │
  ───────────────────────────────────────┼───────────────────────────────────────
  LOCAL COMPLIANCE                       │                       GLOBAL ENTERPRISE
                                         │
          🇵🇰 FlowHCM / TimeTrax          │    🌐 BambooHR / Gusto
          (Local focus, shared DB,       │    (US-centric SMB focus)
           no global subscription APIs)  │
                                         │
```

---

## 🇵🇰 1. Top 5 HRMS Platforms in Pakistan

1. **FlowHCM**: Market leader in automated payroll, FBR income tax slabs, EOBI & PESSI/SESSI compliance.
2. **CultureHCM**: Focuses on modern employee engagement, company culture, peer recognition, and fast onboarding.
3. **TimeTrax (by Efrotech)**: Legacy power tool for hardware biometric attendance integration, shift scheduling & manufacturing ERP sync.
4. **WebHR**: Cloud-native platform featuring mobile self-service (ESS), multi-location tracking, and international team support.
5. **MyHCM / GleamHR**: Comprehensive cloud solution focusing on SME payroll tax compliance, performance tracking, and leave management.

---

## 🌍 2. Top 5 HRMS Platforms Globally

1. **Workday HCM**: Global enterprise standard for enterprise planning, financial integration, and large-scale workforce analytics.
2. **Rippling**: All-in-one HR, IT & Finance platform with workflow automation, device provisioning, and global payroll.
3. **BambooHR**: Premier mid-market HR software known for clean UI, onboarding, and core HR record management.
4. **SAP SuccessFactors**: Enterprise HCM giant for multi-national conglomerates embedded in SAP ERP ecosystems.
5. **Gusto**: Leading SMB payroll & benefits platform for automated compliance and contractor/employee management.

---

## 📊 3. Master Feature Comparison Matrix

| Feature / Architecture Dimension | 🇵🇰 **Awais HR Engine** | 🇵🇰 **FlowHCM** | 🇵🇰 **TimeTrax** | 🌐 **Rippling** | 🌐 **Workday** | 🌐 **BambooHR** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Multi-Tenant Architecture** | 🟢 **Database-per-Tenant** *(Strict RLS Isolation)* | 🟡 Shared Schema | 🔴 Single Tenant / On-Prem | 🟢 Multi-Tenant Cloud | 🟢 Multi-Tenant Cloud | 🟢 Multi-Tenant Cloud |
| **Pakistan Local Payments** | 🟢 **State Bank RAAST & HBL Direct Payouts** | 🟡 Bank CSV Export Only | 🟡 Manual File Exports | 🔴 None | 🔴 None | 🔴 None |
| **Global Multi-Currency Payouts** | 🟢 **Wise Business Batch API & Payoneer** | 🔴 None | 🔴 None | 🟢 Native Global Payroll | 🟢 Global Payroll Partners | 🔴 None (US Focus) |
| **Dual-Control Governance** | 🟢 **Maker-Checker Dual Approval Engine** | 🔴 Single Approval | 🔴 Single Approval | 🟡 Custom Workflow Rules | 🟢 Advanced Governance | 🔴 None |
| **Observability & Telemetry** | 🟢 **Grafana, Prometheus, Loki & OpenTelemetry Tempo** | 🔴 Basic Server Logs | 🔴 Basic Database Logs | 🟡 Internal Log Viewer | 🟢 Enterprise Logging | 🔴 Standard Web Analytics |
| **Dynamic Feature Flags** | 🟢 **65 Modules with Global & Per-Tenant Kill Switches** | 🔴 Fixed Plans | 🔴 Modular Add-on Licenses | 🟢 Custom App Switches | 🟢 Complex Config Flags | 🔴 Plan Tiers Only |
| **Annual Leave Quota Reset** | 🟢 **Calendar-Bound Auto Reset & HR Override API** | 🟡 Basic Annual Reset | 🟡 Basic Reset | 🟢 Advanced Accruals | 🟢 Enterprise Accruals | 🟢 Standard Accruals |
| **FinTech Commission Engine** | 🟢 **Merchant Acquisition & Volume Tier Engine** | 🔴 None | 🔴 None | 🔴 None | 🔴 Requires Custom ERP | 🔴 None |
| **Org Chart & Dept Roster** | 🟢 **Dynamic Hierarchical Tree & Department Modals** | 🟡 Static Hierarchy | 🟡 Basic Tree | 🟢 Interactive Visual Tree | 🟢 Enterprise Org Chart | 🟢 Interactive Org Chart |

---

## 🔬 4. Architectural Deep-Dive Advantages

### 1. Multi-Tenant Architecture & Data Security
* **Local Pakistan Competitors**: Most run on shared-database multi-tenancy (`tenant_id` column in every table). This creates data leak risks and slow database queries as tenant data grows.
* **Global Competitors**: Store customer data in US/EU cloud regions, which violates Pakistani banking and financial data residency regulations.
* **⚡ Awais HR Engine**: Employs **Database-per-Tenant Isolation** (`awais_master` + `awais_<tenant_slug>`). Each tenant's data lives in an isolated PostgreSQL database schema managed by Spring `DynamicRoutingDataSource`, guaranteeing 100% data privacy and SBP compliance.

### 2. Dual Payment Engine (Local Pakistan + Worldwide SaaS)
* **Local Pakistan Competitors**: Generate raw CSV text files for banks. They do not support automated global subscription billing (Stripe/Paddle).
* **Global Competitors**: Excel at ACH and Direct Deposit in US/EU, but have zero integration with Pakistan's State Bank RAAST instant payment gateway or local IBAN formats.
* **⚡ Awais HR Engine**:
  * **SaaS Subscriptions**: Stripe, Paddle, Lemon Squeezy, PayPal.
  * **Payroll Disbursements**: 🇵🇰 State Bank RAAST SPI Instant Payouts & HBL Corporate Clearance | 🌍 Wise Business Batch API (50+ currencies) & Payoneer.

### 3. Governance & Financial Security (Maker-Checker Dual Control)
* **Competitors**: Lack financial dual control. A single HR or payroll officer can process and disburse salaries without mandatory secondary authorization.
* **⚡ Awais HR Engine**: Native **Maker-Checker Dual Control Engine** (`maker_checker_request` table). CFO (`finance.admin@ep-systems.com`) acts as **Maker** to create salary batches, while CEO (`ceo@ep-systems.com`) acts as mandatory **Checker** to approve batch execution.

### 4. Enterprise Observability & System Reliability
* **Competitors**: System administrators have no real-time metrics on database connection pools, memory leaks, or slow queries.
* **⚡ Awais HR Engine**: Full-stack Observability Suite featuring Grafana 10.4 (8 pre-configured dashboards), Prometheus metrics, Loki log aggregator, OpenTelemetry Tempo distributed tracing, and a Dual-Persona Telemetry UI (`/superadmin/observability`).

### 5. Leave Management, Quotas & New Year Auto-Reset
* **Competitors**: Require manual HR interventions at year-end to reset employee leave balances or calculate carry-forwards.
* **⚡ Awais HR Engine**:
  * **Calendar-Bound Quotas**: Calculates remaining balances using `YEAR(start_date) = YEAR(CURRENT_DATE())`.
  * **Automatic New Year Reset**: On January 1st, employee leave balances automatically reset back to full policy allowance (20 Annual, 12 Sick, 10 Casual) without database lockups.
  * **Absentee Delegation Escalation**: If a manager is on leave, pending requests automatically escalate up the org unit hierarchy (`parent_id`) to HR or Executive leadership.

### 6. FinTech & Field Operations Engine
* **Competitors**: Standard HR tools only track fixed monthly salaries. They cannot handle variable field sales commissions or merchant onboarding bonuses.
* **⚡ Awais HR Engine**: Built-in **FinTech Commission & Field Mileage Engine** with Merchant Acquisition Tiers (e.g. PKR 50,000 target @ 2.5% bonus) and Territory Transaction Volume Rules.
