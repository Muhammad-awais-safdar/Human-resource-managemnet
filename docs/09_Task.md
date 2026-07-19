# Product Backlog Checklist: Awais HR

> [!IMPORTANT]
> **Strict Status Update Rules:**
> * Developers and AIs MUST mark task items as in-progress `[/]` immediately upon starting work on a feature.
> * Tasks must ONLY be marked as completed `[x]` once development is completely finished, all unit/integration tests pass, and manual verification is successful.

**Total Project Features:** 34 Core Features (Phases 1 to 34)

---

### Phase 1: SaaS Platform Infrastructure
- `[x]` **Backend:** Dynamic DB allocation, dynamic Flyway migrations, default metadata seeding, DNS wildcard mappings.
- `[x]` **Backend Test:** Routing datasource unit tests; database migration integration tests with Testcontainers.
- `[x]` **Frontend:** Onboarding registration wizard with input validation (React 19 JSX).
- `[x]` **Frontend Integration:** Form actions bound to `POST /api/${api.version}/tenants/register` via Action hooks.

### Phase 2: Domain & Workspace Management
- `[x]` **Backend:** Subdomain validation directory, custom domain CNAME mappings database checks, SSL Let's Encrypt trigger.
- `[x]` **Backend Test:** Host header verification unit tests; SSL trigger mock checks.
- `[x]` **Frontend:** Custom domain mapping setting panels, white-label branding variables inputs (logo, primary color).
- `[x]` **Frontend Integration:** Dynamic variables loading dynamically binding root CSS styles.

### Phase 3: Organization Management
- `[x]` **Backend:** Legal entities, cost centers, departments, teams CRUD; hierarchical org chart graph calculator.
- `[x]` **Backend Test:** Hierarchical loops checks unit tests; parent-child validation integration tests.
- `[x]` **Frontend:** Org Chart canvas renderer (SVG blocks tree representation).
- `[x]` **Frontend Integration:** Tree component data fetching organization endpoints.

### Phase 4: Authentication & Security
- `[x]` **Backend:** Session registry and credentials authentication filters.
- `[x]` **Backend Test:** Unauthorized routes blocking unit tests; MFA validation tests.
- `[x]` **Frontend:** Reset password recovery screen and MFA verification code input cards.
- `[x]` **Frontend Integration:** Credentials handlers, session maps local cookies sync.

### Phase 5: Role-Based Access Control (RBAC) & ABAC
- `[x]` **Backend:** Dynamic roles settings, Dynamic permission matrix mapping tables, PostgreSQL RLS setup.
- `[x]` **Backend Test:** Permission enforcement route unit tests; database RLS scope verification.
- `[x]` **Frontend:** Roles lists dashboard, permissions mappings grid checklist.
- `[x]` **Frontend Integration:** User permissions checker hooks dynamically toggling views.

### Phase 6: Employee Management
- `[x]` **Backend:** Employee timeline states, confirmation date checking, promotions, exit clearance checklists.
- `[x]` **Backend Test:** Lifecycle state transition validation tests.
- `[x]` **Frontend:** Employee lifecycle timelines card, exit clearances dashboard status.
- `[x]` **Frontend Integration:** Lifecyle mutations triggers (confirm, transfer).

### Phase 7: Employee Information
- `[x]` **Backend:** Personal details, passport, visa records, JSONB custom fields metadata parser.
- `[x]` **Backend Test:** Custom field limits validations unit tests.
- `[x]` **Frontend:** Employee profiles view, passport/visa details forms, dynamic custom fields metadata grid manager.
- `[x]` **Frontend Integration:** Form data binding custom metadata maps.

### Phase 8: Employee Self Service (ESS)
- `[x]` **Backend:** ESS profile query scopes (constraining records retrieval to current user ID).
- `[x]` **Backend Test:** Verify employee queries cannot access other employee profiles.
- `[x]` **Frontend:** Personal ESS dashboard displaying logs, leaves, and payslips shortcuts.
- `[x]` **Frontend Integration:** ESS endpoint hooks querying profile resources.

### Phase 9: Manager Self Service (MSS)
- `[x]` **Backend:** Department hierarchies data query scopes (constraining managers actions to their teams).
- `[x]` **Backend Test:** Assert non-department views are rejected with security errors.
- `[x]` **Frontend:** Team approvals center, department attendance indicators list.
- `[x]` **Frontend Integration:** Approvals triggers handlers (Accept/Reject actions).

### Phase 10: Recruitment (ATS)
- `[x]` **Backend:** Vacancy job requisition workflows, candidate applications. Resume parser is fully integrated.
- `[x]` **Backend Test:** Candidate application submissions unit tests.
- `[x]` **Frontend:** Career board lists, Kanban pipelines, and candidate application form simulation modal.
- `[x]` **Frontend Integration:** Resume uploads (regex CV parsing) are fully functional.

### Phase 11: Onboarding
- `[x]` **Backend:** Welcome workflows checklist generation, assets allocation, policy accept registries.
- `[x]` **Backend Test:** Automatic onboarding checklist trigger unit tests.
- `[x]` **Frontend:** Onboarding task progress layout is done; signature capture canvas drawing pad is fully functional.
- `[x]` **Frontend Integration:** Signature compliance saving is fully operational.

### Phase 12: Offboarding
- `[x]` **Backend:** Resignation request workflow, exit interview feedback logging, and final payroll settlement calculators.
- `[x]` **Backend Test:** Resignation state transitions and settlement formula unit tests.
- `[x]` **Frontend:** Exit checklist department tracker screen, clearance dashboards, and settlement calculator overlay.
- `[x]` **Frontend Integration:** Department sign-off actions and settlement approvals mutations.

### Phase 13: Attendance Management
- `[x]` **Backend:** Geofenced punch-in verification coordinates. Biometric scans mock is completed.
- `[x]` **Backend Test:** GPS distance limit checking unit tests.
- `[x]` **Frontend:** Web punch clock card, geofence verification details, and active map location indicators.
- `[x]` **Frontend Integration:** Capturing GPS logs dynamically on clock-in click.

### Phase 14: Shift Management
- `[x]` **Backend:** Shift schedule templates, assignments, and weekly swapping conflict checks.
- `[x]` **Backend Test:** Double booking scheduling collision checks.
- `[x]` **Frontend:** Roster calendar lists and weekly interactive scheduling rosters board.
- `[x]` **Frontend Integration:** Shift card swaps and rosters publish mutations.

### Phase 15: Leave Management
- `[x]` **Backend:** Leave balance deductions, limit validations, and accruals math calculators.
- `[x]` **Backend Test:** Accruals balance calculation verification tests.
- `[x]` **Frontend:** Leave request form, manager approval lists, and Team Leave Calendar.
- `[x]` **Frontend Integration:** Leave requests submission forms mapping.

### Phase 16: Holiday Management
- `[x]` **Backend:** Dynamic holiday tables with regional holiday maps via `regional_holiday` table. `addHoliday()` and `getRegionalHolidays()` fully implemented.
- `[x]` **Backend Test:** `HolidayServiceImplTest` — 3 tests PASS.
- `[x]` **Frontend:** `holidays/page.js` — Add holiday form, regional filter, full calendar table view.
- `[x]` **Frontend Integration:** `POST /suite/holidays` and `GET /suite/holidays/regional` endpoints wired.

### Phase 17: Payroll Engine
- `[x]` **Backend:** Statutory tax engine (10% if gross > $3000), net salary calculation in `PayrollServiceImpl.runPayroll()`. `getAllPayslips()` for HR managers.
- `[x]` **Backend Test:** `PayrollServiceImplTest` — 4 tests PASS (above/below threshold, net calculation).
- `[x]` **Frontend:** `payroll/page.js` — Payroll engine panel with tax breakdown, tabbed payslip views (mine + all).
- `[x]` **Frontend Integration:** `POST /suite/payroll/run` and `GET /suite/payroll/all` endpoints wired.

### Phase 18: Performance Management
- `[x]` **Backend:** Goal creation (`createGoal()`), peer review system (`submitPeerFeedback()`, `getPeerFeedback()`) with rating 1-5 scale. `peer_review` table in V10 migration.
- `[x]` **Backend Test:** `PerformanceServiceImplTest` — 7 tests PASS (goal status transitions, rating boundaries).
- `[x]` **Frontend:** `performance/page.js` — 5-tab UI: goals list with progress bars, create goal, update progress, submit/view peer feedback.
- `[x]` **Frontend Integration:** All endpoints wired: goals CRUD, peer feedback POST/GET.

### Phase 19: Learning Management (LMS)
- `[x]` **Backend:** Quiz engine with `quiz` table (options A-D, correct_answer). `getCourseQuizzes()`, `submitQuizAnswer()` (case-insensitive), `getAllCourses()`, `enrollCourse()` all implemented.
- `[x]` **Backend Test:** `LearningServiceImplTest` — 6 tests PASS (correct, wrong, null, case-insensitive, messages).
- `[x]` **Frontend:** `learning/page.js` — Course catalog, enrollment, interactive quiz with color-coded answer validation.
- `[x]` **Frontend Integration:** All endpoints wired: catalog, enroll, quizzes, quiz answer submit.

### Phase 20: Asset Management
- `[x]` **Backend:** Full `AssetService` + `AssetServiceImpl` built: inventory registry, assign, return, add assets. `asset` table in V10 migration with AVAILABLE/ASSIGNED status tracking.
- `[x]` **Backend Test:** `AssetServiceImplTest` — 6 tests PASS (assign/return row logic, default status).
- `[x]` **Frontend:** `assets/page.js` — Stats panel, full inventory table with return action, my assets cards, add asset form, assign asset form.
- `[x]` **Frontend Integration:** All 5 endpoints wired: GET /all, GET /my, POST /add, POST /assign, POST /return.

### Phase 21: Expense Management
- `[x]` **Backend:** Expense claim database tables exist. S3 receipt attachment triggers, approvals, and threshold calculators implemented.
- `[x]` **Backend Test:** Expense state transition security limits verified in `ExpenseServiceImplTest`.
- `[x]` **Frontend:** Reimbursement status list updated with receipt links and threshold limits check indicators.
- `[x]` **Frontend Integration:** Simulated S3 receipt upload and approval actions wired.

### Phase 22: Travel Management
- `[x]` **Backend:** Travel request schema extended with purpose and approvals. Date checks added.
- `[x]` **Backend Test:** Travel request states validations in `TravelRequestServiceImplTest`.
- `[x]` **Frontend:** Booking itineraries grids and travel approval cards integrated.
- `[x]` **Frontend Integration:** Submit, approve, and reject form actions wired.

### Phase 23: Project & Timesheets (Optional Module)
- `[x]` **Backend:** Project log validation checks, overlap checks, and resource allocations registry implemented.
- `[x]` **Backend Test:** Timesheet validation overlap and 24-hour limit checks in `ProjectServiceImplTest`.
- `[x]` **Frontend:** Weekly timesheet log submission forms.
- `[x]` **Frontend Integration:** Timesheet approval workflow updates.

### Phase 24: Help Desk
- `[x]` **Backend:** Support ticket auto-assignment engine based on open workload, priority metadata, and knowledge base search.
- `[x]` **Backend Test:** Auto-assignment logic unit tests in `TicketServiceImplTest`.
- `[x]` **Frontend:** Support ticket submission forms, admin ticket pipelines layout, and search widgets.
- `[x]` **Frontend Integration:** Dynamic ticket submission forms.

### Phase 25: Document Management
- `[x]` **Backend:** Document logs table extended with S3 tenant isolation folder layout and expiry dates.
- `[x]` **Backend Test:** Expiry notification scheduler tests in `DocumentServiceImplTest`.
- `[x]` **Frontend:** Expiry checkers, document uploaders, and digital signature pad.
- `[x]` **Frontend Integration:** Document signature saves.

### Phase 26: Workflow Engine
- `[x]` **Backend:** Workflow diagrams schemas, condition evaluation triggers, escalations schedulers.
- `[x]` **Backend Test:** Custom escalation timing unit tests.
- `[x]` **Frontend:** Flowchart workflow designer configuration panels.
- `[x]` **Frontend Integration:** Workflow nodes saving.

### Phase 27: Communication & Notifications
- `[x]` **Backend:** Platform announcement logs, notifications queue, email template parsing services.
- `[x]` **Backend Test:** Notification dispatcher unit tests.
- `[x]` **Frontend:** Announcement board feed, notification profile preferences.
- `[x]` **Frontend Integration:** Announcement submits.

### Phase 28: Reports & Analytics
- `[x]` **Backend:** Report query generators, dynamic CSV/PDF template compiler.
- `[x]` **Backend Test:** Export data parsing unit tests.
- `[x]` **Frontend:** Reporting dashboard graphs widgets, metric analytics tables.
- `[x]` **Frontend Integration:** Report download hooks.

### Phase 29: Integrations
- `[x]` **Backend:** G-Suite/M365 OAuth2 mapping logs, webhook publisher engine.
- `[x]` **Backend Test:** Webhook payload delivery unit tests.
- `[x]` **Frontend:** Integrations enable/disable switches panels.
- `[x]` **Frontend Integration:** Webhook target configuration updates.

### Phase 30: Mobile Platform
- `[x]` **Backend:** Mobile synchronization endpoints, offline data delta resolution mappings.
- `[x]` **Backend Test:** Offline synching conflict checkers unit tests.
- `[x]` **Frontend:** Responsive layout optimizations for mobile displays.
- `[x]` **Frontend Integration:** API sync polling actions.

### Phase 31: AI & Automation
- `[x]` **Backend:** CV parsers matches pipelines, anomaly detection, attritions prediction datasets.
- `[x]` **Backend Test:** Anomaly flag thresholds tests (AiAutomationServiceImplTest).
- `[x]` **Frontend:** Resume matching calculator, attrition risk predictions dashboard, and anomaly indicators.
- `[x]` **Frontend Integration:** API calls to AI evaluation and prediction triggers.

### Phase 32: Compliance & Governance
- `[x]` **Backend:** GDPR consent registries, audit tables deletion logs, data retention purging schedulers.
- `[x]` **Backend Test:** Data purge script tests (ComplianceServiceImplTest).
- `[x]` **Frontend:** Consent settings checkbox, purge trigger button, and audit logs grid view.
- `[x]` **Frontend Integration:** GDPR updates and purging routines execution.

### Phase 33: Platform Settings
- `[x]` **Backend:** Company variables, localized conversion tables, currency structures.
- `[x]` **Backend Test:** Localization settings tests (PlatformSettingsServiceImplTest).
- `[x]` **Frontend:** Branding configurations forms, timezones select list, currencies pickers.
- `[x]` **Frontend Integration:** Dynamic branding update triggers.

### Phase 34: Enterprise Features
- `[x]` **Backend:** Dynamic API keys generator with SHA-256 validation, rate limiting rules, tenant database backups mapping.
- `[x]` **Backend Test:** Key rate limit checking tests (EnterpriseFeaturesServiceImplTest).
- `[x]` **Frontend:** Developer API keys settings dashboard, backup snapshot generator.
- `[x]` **Frontend Integration:** API credentials mutations and backup triggers.

---

# Missing Enterprise Features

> These features are not included in the current Task.md.
> They should be considered for future implementation after the core platform.

---

# 35. Workforce Planning

## Description

Strategic workforce planning for future hiring and staffing needs.

### Features

- Workforce forecasting
- Headcount planning
- Position budgeting
- Vacancy planning
- Hiring forecasts
- Department growth planning
- Workforce demand analysis
- Workforce supply analysis
- Scenario planning
- Capacity planning

---

# 36. Succession Planning

## Features

- Successor identification
- Talent pools
- Critical positions
- Readiness assessment
- Promotion planning
- Leadership pipeline
- Replacement planning
- Bench strength analysis

---

# 37. Compensation Management

## Features

- Salary review cycles
- Merit increases
- Compensation bands
- Pay grades
- Bonus planning
- Equity management
- Salary benchmarking
- Compensation approval workflow

---

# 38. Benefits Administration

## Features

- Health insurance
- Life insurance
- Retirement plans
- Allowances
- Employee benefits
- Benefit enrollment
- Benefit eligibility
- Benefit deductions

---

# 39. Workforce Scheduling

> Different from Shift Management.

## Features

- Workforce demand forecasting
- Auto scheduling
- Labor optimization
- Schedule conflict detection
- Availability management
- Open shift bidding

---

# 40. Contractor Management

## Features

- Contractor profiles
- Vendor companies
- Contractor onboarding
- Contractor agreements
- Contractor timesheets
- Contractor billing
- Contractor offboarding

---

# 41. Visitor Management

## Features

- Visitor registration
- QR visitor pass
- Host notification
- Visitor approval
- Visitor history
- Security screening

---

# 42. Compliance Management

## Features

- Labor law compliance
- Country compliance
- Compliance checklists
- Internal audits
- Risk assessments
- Policy acknowledgements
- Compliance reports

---

# 43. Health & Safety

## Features

- Incident reporting
- Accident reporting
- Safety training
- Risk assessments
- Emergency contacts
- Medical incidents
- PPE tracking

---

# 44. Employee Engagement

## Features

- Employee surveys
- Pulse surveys
- Feedback
- Recognition
- Rewards
- Employee sentiment
- Suggestion box
- Employee communities

---

# 45. Career Development

## Features

- Career paths
- Internal mobility
- Skill gap analysis
- Mentorship
- Development plans
- Individual growth plans

---

# 46. Workforce Analytics

## Features

- Attrition analytics
- Diversity analytics
- Hiring analytics
- Attendance trends
- Leave trends
- Productivity analytics
- Compensation analytics
- Executive dashboards

---

# 47. Knowledge Management

## Features

- Knowledge base
- SOP library
- Policy library
- Wiki
- FAQs
- Learning articles

---

# 48. Internal Communication

## Features

- Company announcements
- Employee feed
- Department feed
- Polls
- Events
- Birthday reminders
- Anniversary reminders

---

# 49. Enterprise Search

## Features

- Global search
- Employee search
- Document search
- Policy search
- AI semantic searchc

---

# 50. Data Migration

## Features

- CSV import
- Excel import
- Legacy HR migration
- Validation
- Duplicate detection
- Migration reports

---

# 51. API Marketplace

## Features

- Public APIs
- API catalog
- SDK downloads
- API keys
- OAuth clients
- API documentation
- API usage analytics

---

# 52. Developer Platform

## Features

- Webhooks
- Event subscriptions
- Sandbox tenants
- API testing
- CLI tools

---

# 53. Marketplace

## Features

- Installable modules
- Third-party integrations
- Plugin management
- Marketplace billing
- Marketplace reviews

---

# 54. Localization

## Features

- Multi-language UI
- RTL support
- Local holidays
- Local payroll formats
- Country-specific settings
- Date formats
- Number formats

---

# 55. Accessibility

## Features

- WCAG compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Font scaling

---

# 56. Business Continuity

## Features

- Disaster recovery
- Backup verification
- High availability
- Failover
- Tenant restore
- Database recovery

---

# 57. Platform Operations

## Features

- Tenant monitoring
- Usage monitoring
- Health monitoring
- Queue monitoring
- Background jobs
- Scheduler
- Audit center
- System metrics

---

# 58. AI Copilot

## Features

- AI HR Assistant
- AI Company Assistant
- AI Workflow Builder
- AI Report Generator
- AI Policy Assistant
- AI Employee Chat
- AI Search
- AI Insights

---

# 59. Mobile Enterprise

## Features

- Employee App
- Manager App
- Admin App
- Offline mode
- Offline attendance
- Push notifications
- Biometric login

---

# 60. Enterprise Administration

## Features

- Super Admin
- Tenant Management
- Tenant Analytics
- Tenant Billing
- Platform Configuration
- Feature Flags
- Maintenance Mode
- Support Dashboard
- Impersonation
- License Management

---

---

# ───────────────────────────────────────────
# NEW PHASES — Gap Analysis (July 2026)
# ───────────────────────────────────────────

> The following phases were identified after a deep analysis of the existing 34 core phases,
> all documentation files, module catalog, and industry benchmarks.
> These are REAL gaps — not duplicates of existing features.

---

# Phase 61: Subscription & Billing Engine

> **Gap Identified:** Phases 1–34 mention `subscription` and `pricing_plan` tables in the schema
> but there is NO implemented billing workflow, invoice generation, or payment capture.
> The Features.md lists "Payment Gateway Integration (Stripe)" as planned but it is NOT built.

## Features

- Subscription plan selection (Starter / Growth / Enterprise tiers)
- Module-based pricing (pay per active module)
- Trial period management (14-day trial, auto-expire)
- Stripe webhook sync (payment success, failed, refund events)
- Invoice generation (PDF) and invoice history
- Billing portal (update card, download invoices)
- Grace period & account suspension on payment failure
- Proration calculator on plan upgrades/downgrades
- Usage-based billing (per employee seat count)
- Billing notifications (upcoming renewal, payment failed alerts)

### Backend
- `[ ]` `SubscriptionService` + `BillingController`
- `[ ]` Stripe webhook listener (`/webhooks/stripe`)
- `[ ]` Invoice PDF generator
- `[ ]` Auto-suspend scheduler on overdue payments
- `[ ]` Unit tests: trial expiry, plan limits, proration math

### Frontend
- `[ ]` `/settings/billing` — current plan, usage bar, next invoice
- `[ ]` Plan upgrade modal with feature comparison table
- `[ ]` Invoice history list with PDF download

---

# Phase 62: Super Admin Dashboard

> **Gap Identified:** Features.md lists "Super Admin Dashboard" but it is completely absent
> from all 34 implemented phases. There is no platform-level admin panel to manage tenants.

## Features

- Multi-tenant overview table (all companies, plan, status, employee count)
- Tenant drill-down (usage metrics, recent activity, error logs)
- Tenant impersonation (login as tenant admin)
- Tenant suspension / reactivation / deletion
- Global feature flag toggles per tenant
- Maintenance mode toggle (show maintenance page to tenant users)
- Platform-wide announcement broadcast
- New tenant manual provisioning
- Support ticket escalation view (from Help Desk)
- Real-time tenant health dashboard (API latency, DB connections)

### Backend
- `[ ]` `SuperAdminController` — guarded by `SUPER_ADMIN` role scope
- `[ ]` `TenantManagementService` — CRUD all tenants
- `[ ]` Impersonation token issuer (time-limited JWT with tenant context)
- `[ ]` Platform metrics aggregator
- `[ ]` Unit tests: impersonation scope isolation, suspension state

### Frontend
- `[ ]` `/superadmin/tenants` — tenant grid with search, filter, status badges
- `[ ]` `/superadmin/tenants/[id]` — tenant detail with usage charts
- `[ ]` Platform settings panel for feature flags

---

# Phase 63: SSO & Advanced Authentication

> **Gap Identified:** Phase 4 covers basic JWT login/MFA but the Features.md clearly states
> "SSO (SAML 2.0 / Okta integration)" — this is NOT implemented. Enterprise clients require SSO.

## Features

- SAML 2.0 Identity Provider (IdP) configuration per tenant
- Okta / Azure AD / Google Workspace SSO
- SSO attribute mapping (email → employee record sync)
- Just-in-Time (JIT) employee provisioning on first SSO login
- SCIM 2.0 user provisioning (auto-create/disable employees via IdP)
- OAuth 2.0 / OpenID Connect support
- SSO enforcement mode (block password login when SSO enabled)
- Session timeout policies per role
- Trusted device management
- Login audit log (device, IP, location, timestamp)

### Backend
- `[ ]` SAML 2.0 assertion consumer endpoint
- `[ ]` SCIM 2.0 `/scim/v2/Users` endpoint
- `[ ]` IdP configuration table per tenant
- `[ ]` JIT provisioning service
- `[ ]` Unit tests: SAML assertion parsing, SCIM sync

### Frontend
- `[ ]` `/settings/sso` — IdP setup wizard (upload metadata XML, test connection)
- `[ ]` Login page SSO button (dynamic per tenant domain)
- `[ ]` Active session list in security settings

---

# Phase 64: Unified Approvals Inbox (Horizon 1 — Frontend Completion)

> **Gap Identified:** Backend for Unified Approvals was built (ApprovalController, ApprovalServiceImpl)
> and the frontend page exists, but it is NOT connected to real approval action APIs with
> optimistic UI updates, real-time polling, and manager notification badges.

## Features

- Real-time pending count badge in sidebar (auto-refresh every 60s)
- Grouped approval cards by type (Leave / Expense / Travel / Timesheet / Clearance)
- Bulk approve / bulk reject actions
- Approval comments / rejection reason (required before rejecting)
- Delegation: assign approval to another manager
- Escalation: flag as overdue if pending > 48h
- Approval history log (who approved/rejected, timestamp)
- Email notification on action to employee

### Backend
- `[ ]` `POST /approvals/{type}/{id}/action` — add required comment field
- `[ ]` `POST /approvals/bulk-action` — batch approve/reject
- `[ ]` `GET /approvals/count` — pending count for badge
- `[ ]` Delegation table + `POST /approvals/{id}/delegate`
- `[ ]` Unit tests: delegation, overdue escalation trigger

### Frontend
- `[ ]` Sidebar badge showing live pending count
- `[ ]` Bulk selection checkboxes + bulk action toolbar
- `[ ]` Rejection reason modal (required comment)
- `[ ]` Approval history tab in each request detail

---

# Phase 65: Employee 360 Profile (Horizon 1 — Frontend Completion)

> **Gap Identified:** Backend `GET /employee/{id}/360` is built and frontend page exists,
> but the profile page is missing: skills matrix, career timeline, compensation history,
> document vault access, and manager notes — all critical for a real 360 view.

## Features

- Skills & certifications matrix (with proficiency level indicators)
- Career timeline (joined, promotions, transfers, role changes)
- Compensation history (salary changes with effective dates)
- Goal & OKR progress summary
- Attendance pattern chart (last 30 days heatmap)
- Manager private notes (only visible to direct manager + HR)
- Documents tab (contracts, offer letter, certificates)
- Emergency contacts quick view
- Training completions & LMS progress
- Direct reports list (if manager)

### Backend
- `[ ]` Extend `GET /employee/{id}/360` with compensation history and skills data
- `[ ]` `POST /employee/{id}/manager-notes` — private notes CRUD
- `[ ]` Unit tests: 360 aggregation completeness

### Frontend
- `[ ]` Skills matrix tab with radar chart visualization
- `[ ]` Compensation history tab with timeline chart
- `[ ]` Manager notes tab (role-gated visibility)
- `[ ]` Attendance heatmap for last 30 days

---

# Phase 66: Salary Structure Builder

> **Gap Identified:** Phase 17 (Payroll) runs payroll with a hardcoded tax rule (10% if gross > $3000).
> There is NO salary component designer, pay grade matrix, or allowance rule builder.
> This is a critical gap for any real client deployment.

## Features

- Salary component builder (Basic, HRA, Transport, Meal, Medical, etc.)
- Fixed vs. percentage-based component types
- Taxable vs. non-taxable component flags
- Salary structure templates (assign per job grade or employee)
- Pay grade matrix (Grade A → Grade F with min/max bands)
- Salary revision workflow (HR proposes → Finance approves)
- Effective date management for salary changes
- Arrears calculation on backdated revisions
- CTC (Cost to Company) breakdown view
- Salary structure cloning

### Backend
- `[ ]` `salary_component` + `salary_structure` + `salary_structure_component` tables
- `[ ]` `SalaryStructureService` — assign structure to employee
- `[ ]` Payroll engine refactor: use dynamic components instead of hardcoded tax
- `[ ]` Arrears calculator
- `[ ]` Unit tests: component aggregation, arrears math

### Frontend
- `[ ]` `/settings/salary-structures` — component builder with drag & drop ordering
- `[ ]` Pay grade matrix editor table
- `[ ]` Salary revision approval workflow UI
- `[ ]` Employee salary breakdown CTC card

---

# Phase 67: Smart Notification Center

> **Gap Identified:** Phase 27 stores `notification_log` records but there is NO in-app
> notification bell/dropdown, no read/unread state management, no real-time delivery (WebSocket/SSE),
> and no employee-facing notification preferences screen.

## Features

- In-app notification bell with unread count badge
- Notification dropdown (last 20 items with mark-as-read)
- Mark all as read action
- Notification categories: Approvals, Payroll, Leave, System, Announcements
- Real-time delivery via Server-Sent Events (SSE)
- Employee notification preferences (what to receive, how: email/in-app/push)
- Email digest (daily/weekly summary option)
- Scheduled reminders (e.g., "Complete your timesheet by Friday")
- Birthday & work anniversary auto-notifications
- Push notification integration (Firebase Cloud Messaging for PWA)

### Backend
- `[ ]` `GET /notifications/mine` — paginated notifications for current user
- `[ ]` `POST /notifications/read-all`
- `[ ]` SSE endpoint `GET /notifications/stream`
- `[ ]` Notification preference save/load API
- `[ ]` Birthday/anniversary cron scheduler
- `[ ]` Unit tests: unread count, SSE delivery, preference filtering

### Frontend
- `[ ]` Notification bell icon in top nav with live badge
- `[ ]` Notification dropdown panel
- `[ ]` `/settings/notifications` — preference toggles per category
- `[ ]` Toast notifications for real-time approvals

---

# Phase 68: Payroll & Bank Integration

> **Gap Identified:** Phase 17 generates payslips but there is NO bank file export,
> no direct deposit file format support (NACHA / BACS / SIF), and no integration
> with accounting systems (QuickBooks, Xero, SAP).

## Features

- Bank file export (NACHA ACH format for US, BACS for UK, SIF for Pakistan)
- Direct deposit configuration per employee (bank name, IBAN, routing number)
- Multi-bank payroll disbursement (different banks per employee)
- Payroll journal entry export (GL codes mapping to Xero/QuickBooks)
- Payroll lock: freeze payroll period to prevent edits
- Payroll reversal workflow (undo a mistaken run)
- Salary advance management (request → approve → auto-deduct next payroll)
- Overtime calculation (1.5x / 2x rates, configurable per policy)
- Loan management (advance loans with EMI deduction schedule)
- Tax certificate generation (annual P60 / W-2 equivalent)

### Backend
- `[ ]` `BankExportService` — generate NACHA/BACS/SIF files
- `[ ]` `PayrollLockService` — prevent edit after lock date
- `[ ]` Loan EMI deduction scheduler
- `[ ]` GL journal entry generator
- `[ ]` Unit tests: NACHA format correctness, EMI schedule math

### Frontend
- `[ ]` Payroll run detail: "Export Bank File" button per format
- `[ ]` Employee bank account setup in profile
- `[ ]` Loan management panel with repayment schedule view
- `[ ]` Payroll lock indicator + unlock confirmation modal

---

# Phase 69: Interview Scheduling & Offer Management

> **Gap Identified:** Phase 10 (ATS) has vacancy postings, Kanban pipeline, and resume parsing
> but is completely missing interview scheduling, calendar sync, offer letter generation,
> and offer approval workflow — the most critical parts of ATS after candidate screening.

## Features

- Interview slot scheduler (HR books slots, sends calendar invites)
- Panel interviewer assignment (multi-interviewer rounds)
- Video interview link generation (Zoom / Google Meet integration)
- Interview scorecard & feedback form per interviewer
- Offer letter template builder (dynamic merge fields)
- Offer approval workflow (HR draft → Manager → Finance approve)
- Digital offer acceptance (candidate clicks link → e-signs)
- Offer expiry management (auto-withdraw after N days)
- Background check integration trigger (post-offer)
- Recruitment analytics (time-to-hire, source effectiveness, offer acceptance rate)

### Backend
- `[ ]` `interview_schedule` table + `InterviewService`
- `[ ]` `offer_letter` table + `OfferService`
- `[ ]` Calendar invite sender (iCal format)
- `[ ]` Offer e-sign token endpoint
- `[ ]` Recruitment analytics query service
- `[ ]` Unit tests: offer expiry, scorecard aggregation

### Frontend
- `[ ]` Interview scheduler modal on candidate Kanban card
- `[ ]` Scorecard form per interviewer per round
- `[ ]` Offer letter builder with template variables
- `[ ]` Candidate offer acceptance portal (public URL)
- `[ ]` Recruitment analytics dashboard (funnel charts, time-to-hire)

---

# Phase 70: Audit Center & Activity Log

> **Gap Identified:** Phase 32 has compliance consent logs but there is NO unified,
> searchable, exportable audit trail for WHO did WHAT to WHICH record and WHEN.
> This is a mandatory requirement for ISO 27001, SOC2, and enterprise clients.

## Features

- Immutable audit log for all data mutations (create / update / delete)
- Captures: actor email, action type, entity type, entity ID, old value, new value, timestamp, IP
- Searchable by: user, date range, module, action type
- Exportable audit report (CSV / PDF)
- Real-time audit stream for SIEM integration (syslog format)
- Sensitive field masking in logs (SSN, bank account numbers)
- Retention policy (configurable: 1yr / 3yr / 7yr)
- Tamper detection (hash chain verification)
- Admin-only access to full audit center
- Module-level audit summaries in each module dashboard

### Backend
- `[ ]` `audit_log` table with JSONB `old_value` / `new_value` columns
- `[ ]` `AuditAspect` — AOP interceptor on all service mutations
- `[ ]` `AuditService` — search + export
- `[ ]` Hash chain integrity checker
- `[ ]` Unit tests: old/new value capture, sensitive field masking

### Frontend
- `[ ]` `/audit` — full audit log table with advanced filters
- `[ ]` Export button (CSV / PDF)
- `[ ]` Audit summary widget on each module page (last 5 changes)

---

# Phase 71: Tenant Analytics & SaaS Metrics

> **Gap Identified:** Features.md lists "Tenant Health Monitoring & Usage Analytics" and
> "Tenant Analytics" under Enterprise Administration — but nothing is built for this.
> A SaaS platform MUST track product usage to identify churn risk and upsell opportunities.

## Features

- Per-tenant usage metrics (DAU, MAU, API call volume, storage used)
- Module adoption tracking (which modules are actively used per tenant)
- Feature engagement heatmap (most used vs. abandoned features)
- Employee count growth chart (headcount trend per tenant)
- Churn risk score (based on login frequency + feature adoption)
- Payroll run frequency tracker
- Leave & attendance submission volume
- Super admin SaaS dashboard (MRR, ARR, active tenants, churned tenants)
- Tenant health score (composite metric: activity + error rate + plan tier)
- Automated alerts on churn signals (tenant went dark for 7 days)

### Backend
- `[ ]` `tenant_usage_event` table for event tracking
- `[ ]` Analytics aggregation scheduler (nightly rollup cron)
- `[ ]` `TenantAnalyticsService` — metrics query API
- `[ ]` Churn score calculator
- `[ ]` Unit tests: metric aggregation, churn threshold logic

### Frontend
- `[ ]` `/superadmin/analytics` — SaaS KPI dashboard (MRR chart, active tenant list)
- `[ ]` Per-tenant analytics drill-down (usage breakdown by module)
- `[ ]` Churn risk indicator badges on tenant table

---
