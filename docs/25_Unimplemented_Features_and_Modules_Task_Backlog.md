📋 Unimplemented & Planned Features Task Backlog

> [!IMPORTANT]
> **Product Backlog & Future Capability Roadmap**
> This document lists **ALL non-implemented, planned, target capability engines, integration gateways, and module extensions** across all 25 industry verticals as identified in `docs/23_Industry_Module_Implementation_Audit_Report.md` and `docs/24_Tenant_Industry_Provisioning_and_Module_Isolation_Architecture.md`.

---

## 🎯 1. Platform Infrastructure & Dynamic Provisioning

- [  ] **Dynamic Tenant Industry Pack Provisioning Enhancements**
  - [  ] Add Industry Capability Pack selector dropdown during tenant signup in Super Admin portal & onboarding wizard (`TenantRegisterWizard.jsx`)
  - [  ] Build dynamic Flyway database schema migration runner for industry-specific tables during tenant onboarding

---

## 🏭 2. Specialized Industry Capability Engines & Modules (Across 25 Verticals)

### 💻 1. IT, Technology & Software Services

- [  ] **Developer Project Timesheet Ingestion Service** (Git commit & Jira worklog webhook listener: `DevTimesheetController.java`)
- [  ] **Stock & Equity Option Grant Tracker** (Vesting schedule calculator & employee equity portal: `EquityVestingController.java`)
- [ ] **Automated Coding Assessment Test Integrations** (HackerRank / LeetCode webhook result parsing)

### 🏭 2. Manufacturing, Heavy Industry & Automotive

- [  ] **Piece-Rate Factory Production Payroll Engine** (Output-based factory wage calculation engine: `PieceRatePayrollController.java`)
- [  ] **Real-Time Biometric TCP/IP Push Listener Socket Gateway** (ZKTeco ADMS / Hikvision TCP 8099 socket listener service: `BiometricSocketListenerService.java`)
- [ ] **Plant Machinery Maintenance Responsibility Matrix** (Preventive maintenance schedule assigned to operators)

### 🛍️ 3. Retail, Supermarkets & E-Commerce

- [  ] **POS Sales Register Commission Sync Engine** (Auto-calculate sales associate commissions from POS logs: `RetailModuleController.java`)
- [  ] **Demand-Based AI Store Shift Roster Generator** (Foot-traffic & sales volume staffing prediction: `RetailModuleController.java`)
- [  ] **Shift Bidding Marketplace for Part-Time Workers** (Open shift board for retail part-timers: `RetailModuleController.java`)

### 🏥 4. Healthcare, Hospitals & Pharmaceuticals

- [  ] **Automated Nurse Shift Swap Marketplace** (Peer-to-peer nurse shift trade board & supervisor approvals: `HealthcareModuleController.java`)
- [  ] **Medical & Nursing State License Registry Lookup API** (Automated state board API license validation: `HealthcareModuleController.java`)
- [  ] **GxP Clinical Laboratory Qualification Matrix** (Pharma lab equipment qualification tracking: `HealthcareModuleController.java`)

### 🏦 5. Banking, Financial Services & Insurance (BFSI)

- [  ] **Automated Direct Bank Disbursement ISO 20022 XML Gateway** (Raast/ACH ISO 20022 XML export: `BFSIServicesController.java`)
- [  ] **Maker-Checker Dual-Authorization Enforcement** (Enforce two-person approvals for salary revisions: `BFSIServicesController.java`)
- [  ] **Mandatory 10-Day Consecutive Block Leave Validator** (System rule for sensitive role block leave: `BFSIServicesController.java`)

### 🏨 6. Hospitality, Hotels & Restaurants (HoReCa)

- [  ] **Automated Restaurant Tip Split & Pool Distribution Engine** (POS tip pool allocation to staff: `HospitalityModuleController.java`)
- [  ] **Housekeeping Room Cleaning Credit Bonus Calculator** (Piece-rate pay per room cleaned: `HospitalityModuleController.java`)

### 🏗️ 7. Construction, Real Estate & Field Services

- [  ] **Weather Delay Auto-Attendance Pause Plugin** (OpenWeatherMap API weather delay trigger: `ConstructionModuleController.java`)
- [  ] **Site Subcontractor Gate Pass Badge & QR Generator** (Dynamic QR gate pass for daily site labor: `ConstructionModuleController.java`)

### 🚚 8. Logistics, Supply Chain & Fleet Transport

- [  ] **Driver DOT / EU Rest-Period Driving Hours Validator** (Enforce legal driving hour limits: `LogisticsModuleController.java`)
- [  ] **Fleet Telematics GPS Ingestion Service** (Samsara / Geotab API mileage & engine hours sync: `LogisticsModuleController.java`)
- [  ] **Per-Kilometer Trip Allowance Calculation Engine** (Distance-based driver payroll allowance: `LogisticsModuleController.java`)

### 🎓 9. Education, Universities & School Networks

- [  ] **Faculty Lecture Credit & Overload Payroll Multiplier** (Extra credit-hour teaching load calculator: `EducationModuleController.java`)
- [  ] **Tenure Track Milestone Review & Sabbatical Workflow** (Multi-stage faculty review pipeline: `EducationModuleController.java`)
- [  ] **Student Information System (SIS) Workload Sync** (Course schedule & faculty assignment import)

### 💼 10. Professional Services, Consulting & Law Firms

- [  ] **Partner Profit Share & Equity Dividend Calculator** (Tiered profit pool distribution engine: `ConsultingModuleController.java`)
- [  ] **Consultant Billable Utilization Rate & Bench Analytics** (Real-time billable vs. bench dashboard: `ConsultingModuleController.java`)
- [  ] **QuickBooks / Xero Reimbursable Expense Billing Sync** (Export client expenses to invoices)

### 🛡️ 11. Insurance

- [  ] Underwriter & broker tiered commission calculator (`IndustryVerticalsSuiteController.java`)
- [  ] Policy claims adjuster performance KPI scorecard
- [  ] State insurance licensing board automated certification renewal alerts

### 💊 12. Life Sciences & Pharmaceuticals

- [  ] FDA Title 21 CFR Part 11 compliant electronic signature audit trail (`IndustryVerticalsSuiteController.java`)
- [  ] Cleanroom chemical exposure & hazardous safety incident logging
- [  ] Scientific research team publication & patent grant bonus tracker

### 📡 13. Telecommunications

- [  ] Tower climb technician high-altitude safety certification checker (`IndustryVerticalsSuiteController.java`)
- [  ] Emergency network outage dispatch workforce recall trigger
- [  ] Fiber optic cable installation turnaround bonus calculator

### 🎬 14. Media, Entertainment & Creative Industries

- [  ] Film & TV daily production call-sheet roster builder (`IndustryVerticalsSuiteController.java`)
- [  ] SAG-AFTRA / IATSE union overtime rule & meal penalty calculator
- [  ] Creative talent digital portfolio & audition media asset vault

### ⚡ 15. Energy & Utilities

- [  ] High-voltage certified substation operator duty logging (`IndustryVerticalsSuiteController.java`)
- [  ] Power grid emergency outage workforce dispatch trigger
- [  ] Environmental safety compliance audit log

### 🛢️ 16. Oil & Gas

- [  ] Offshore rig rotational roster (2 weeks on / 2 weeks off) engine (`IndustryVerticalsSuiteController.java`)
- [  ] Remote desert / offshore camp berth accommodation assignment module
- [  ] Hazardous location offshore per-diem allowance calculator

### ⛏️ 17. Mining

- [  ] Underground mine cap-lamp & safety gear checkout log (`IndustryVerticalsSuiteController.java`)
- [  ] Heavy quarry excavator operator qualification validator
- [  ] Mine safety air quality & hazardous gas exposure monitoring log

### 🚗 18. Automotive

- [  ] Vehicle assembly line station worker rotation scheduler (`IndustryVerticalsSuiteController.java`)
- [  ] Factory defect penalty & zero-defect quality bonus calculator
- [  ] Assembly tool calibration & maintenance responsibility matrix

### ✈️ 19. Aerospace & Defense

- [  ] DoD Defense security clearance (Secret / Top Secret) renewal tracker (`IndustryVerticalsSuiteController.java`)
- [  ] ITAR / EAR controlled technology access permission validator
- [  ] Classified defense project work breakdown timesheet ledger

### 🏛️ 20. Government & Public Sector

- [  ] Civil service pay scale step-increment auto-calculator (`IndustryVerticalsSuiteController.java`)
- [  ] Public sector merit panel interview scoring workflow
- [  ] Inter-departmental civil servant deputation & transfer workflow

### 🤝 21. Nonprofit & NGO

- [  ] Donor grant fund workforce time allocation split (`IndustryVerticalsSuiteController.java`)
- [  ] Volunteer hours tracking & stipend reimbursement engine
- [  ] Multi-country field per-diem currency converter

### 🌾 22. Agriculture & Agribusiness

- [  ] Harvest season crop yield piece-rate pay calculator (`IndustryVerticalsSuiteController.java`)
- [  ] Farm labor camp accommodation & transport roster
- [  ] Pesticide handler safety certification expiry alerts

### 📦 23. Wholesale & Distribution

- [  ] Warehouse forklift operator safety certification tracker (`IndustryVerticalsSuiteController.java`)
- [  ] Night shift picking incentive & order volume bonus engine
- [  ] Distribution driver delivery turnaround scorecards

### 🏟️ 24. Sports, Events & Entertainment Operations

- [  ] Stadium event-day usher & security roster builder (`IndustryVerticalsSuiteController.java`)
- [  ] Athlete medical clearance & anti-doping test tracker
- [  ] Event box-office ticket commission payout engine

### 🏢 25. Real Estate & Property Management

- [  ] Commercial facility technician 24/7 on-call rotation roster (`IndustryVerticalsSuiteController.java`)
- [  ] Tenant leasing agent sales commission tier calculator
- [  ] Maintenance vendor access badge & gate clearance manager

---

## ⚡ 3. Advanced Enterprise & Security Extensions

- [  ] **AI Workforce Copilot Autonomous Resume Screener**: Autonomous candidate ranking & attrition risk prediction (`/ai-copilot`)
- [  ] **Cross-Tenant Macro Analytics Dashboard**: Super Admin ARR, module utilization, and tenant churn analytics (`/superadmin/analytics`)
- [  ] **Field-Level Encryption**: AES-256 field-level database encryption for employee SSN / Tax IDs (`FieldLevelEncryptionService.java`)
- [  ] **Native Mobile App Builds**: Package React Native / Expo iOS & Android builds for App Store & Google Play
