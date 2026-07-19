# Module Catalog: Complete 34 Feature Specification

This document details the functional scopes, database tables, and API endpoint boundaries for all 34 modules of **Awais HR**.

---

## 1. SaaS Platform Infrastructure
Provides tenant isolation, database allocation, subscriptions, billing, and platform analytics.
*   **Key Database Tables:** `tenant`, `tenant_domain`, `subscription`, `module`, `tenant_module`, `pricing_plan`.
*   **Core API Endpoint:** `/api/${api.version}/tenants/register`

## 2. Domain & Workspace Management
Handles subdomain and custom domain name resolutions, SSL certificate issuance, and white-label branding.
*   **Key Database Tables:** `tenant_domain`, `white_label_config`.
*   **Core API Endpoint:** `/api/${api.version}/domains/verify`

## 3. Organization Management
Maps legal structures, locations, departments, teams, cost centers, and hierarchies.
*   **Key Database Tables:** `legal_entity`, `branch`, `department`, `team`, `cost_center`, `designation`, `job_grade`.
*   **Core API Endpoint:** `/api/${api.version}/organization/structure`

## 4. Authentication & Security
Manages credential verification, active session tracking, multi-factor codes, and IP restrictions.
*   **Key Database Tables:** `user_credential`, `active_session`, `mfa_token`, `ip_whitelist`.
*   **Core API Endpoint:** `/api/${api.version}/auth/login`

## 5. Role-Based Access Control (RBAC) & ABAC
Database-driven dynamic permission mappings and Row-Level Security (RLS) data access matrices.
*   **Key Database Tables:** `permission`, `role`, `role_permission`, `employee_role`.
*   **Core API Endpoint:** `/api/${api.version}/auth/roles`

## 6. Employee Management
Tracks employee directories and lifecycle states (probation, promotions, exit clearances).
*   **Key Database Tables:** `employee`, `employment_history`, `lifecycle_event`, `clearance_checklist`.
*   **Core API Endpoint:** `/api/${api.version}/employees`

## 7. Employee Information
Maps dynamic JSONB custom attributes alongside standard columns (passport, visa, driving licenses).
*   **Key Database Tables:** `employee_detail`, `passport_visa_log`, `custom_field_value`.
*   **Core API Endpoint:** `/api/${api.version}/employees/{id}/details`

## 8. Employee Self Service (ESS)
Allows employees to check payslips, leaves balances, log expenses, and update contacts.
*   **Key Database Tables:** Read-only queries of employee-owned rows.
*   **Core API Endpoint:** `/api/${api.version}/ess/dashboard`

## 9. Manager Self Service (MSS)
Enables department leads to review shift assignments, approve leaves, and check performance scores.
*   **Key Database Tables:** Read/write queries within managed department parameters.
*   **Core API Endpoint:** `/api/${api.version}/mss/approvals`

## 10. Recruitment (ATS)
Coordinates vacancy postings, career portal landing sheets, resumes OCR parsing, and hiring funnels.
*   **Key Database Tables:** `job_posting`, `candidate_profile`, `job_application`, `interview_round`.
*   **Core API Endpoint:** `/api/${api.version}/recruitment/applications`

## 11. Onboarding
Automates welcoming portals, documents compilation, and assets dispatch checklists.
*   **Key Database Tables:** `onboarding_checklist`, `document_submission_log`.
*   **Core API Endpoint:** `/api/${api.version}/onboarding/checklists`

## 12. Offboarding
Coordinates resignation workflows, exit clearance sign-offs, and final settlements.
*   **Key Database Tables:** `offboarding_case`, `clearance_department_log`.
*   **Core API Endpoint:** `/api/${api.version}/offboarding/cases`

## 13. Attendance Management
Logs clock check times with GPS coordinates, geofences validation, and biometric device hooks.
*   **Key Database Tables:** `attendance_log`, `attendance_correction`.
*   **Core API Endpoint:** `/api/${api.version}/attendance`

## 14. Shift Management
Coordinates calendars, rostering schedules, weekly rotations, and shift swap requests.
*   **Key Database Tables:** `shift_template`, `shift_assignment`, `shift_swap_request`.
*   **Core API Endpoint:** `/api/${api.version}/shifts/assignments`

## 15. Leave Management
Enforces leave accrual policies, carry-forwards, encashment values, and approval loops.
*   **Key Database Tables:** `leave_type`, `leave_policy`, `leave_request`, `leave_balance`.
*   **Core API Endpoint:** `/api/${api.version}/leave/requests`

## 16. Holiday Management
Controls regional, national, and branch-level holiday calendars.
*   **Key Database Tables:** `holiday_event`, `branch_holiday_mapping`.
*   **Core API Endpoint:** `/api/${api.version}/holidays`

## 17. Payroll Processing
Evaluates taxable components, bonuses, deducts statutory values, and compiles bank payout files.
*   **Key Database Tables:** `payroll_run`, `payslip`, `salary_component`, `tax_deduction_formula`.
*   **Core API Endpoint:** `/api/${api.version}/payroll/runs`

## 18. Performance Management
Maps OKRs key results, KPIs metrics, peer reviews, and performance matrix metrics.
*   **Key Database Tables:** `okr_objective`, `okr_key_result`, `performance_review`, `peer_feedback`.
*   **Core API Endpoint:** `/api/${api.version}/performance/okrs`

## 19. Learning Management (LMS)
Provisions training courses, paths tracking, assessments, and certifications.
*   **Key Database Tables:** `lms_course`, `learning_path_enrollment`, `assessment_log`.
*   **Core API Endpoint:** `/api/${api.version}/lms/courses`

## 20. Asset Management
Logs asset categories, serial assignments, return validations, warranties, and maintenance.
*   **Key Database Tables:** `asset_item`, `asset_category`, `asset_assignment_log`.
*   **Core API Endpoint:** `/api/${api.version}/assets`

## 21. Expense Management
Validates receipt OCR claims (stored on S3), travel expenses, and payouts.
*   **Key Database Tables:** `expense_claim`, `expense_receipt`, `expense_reimbursement`.
*   **Core API Endpoint:** `/api/${api.version}/expenses/claims`

## 22. Travel Management
Manages corporate travel logs, authorization processes, itineraries, and accommodations mapping.
*   **Key Database Tables:** `travel_request`, `travel_itinerary`.
*   **Core API Endpoint:** `/api/${api.version}/travel/requests`

## 23. Projects & Timesheets (Optional)
Tracks tasks assignments, timesheet submission approvals, and billable project hours.
*   **Key Database Tables:** `project_item`, `project_task`, `timesheet_log`.
*   **Core API Endpoint:** `/api/${api.version}/projects/timesheets`

## 24. Help Desk & Ticket System
Handles HR, IT, and facilities tickets, dynamic assignments, and knowledge bases.
*   **Key Database Tables:** `helpdesk_ticket`, `ticket_response`, `kb_article`.
*   **Core API Endpoint:** `/api/${api.version}/helpdesk/tickets`

## 25. Document Management
Compiles contracts, templates, digital signatures, and versioning control.
*   **Key Database Tables:** `document_vault`, `document_template`, `digital_signature_log`.
*   **Core API Endpoint:** `/api/${api.version}/documents`

## 26. Dynamic Workflow Engine
Orchestrates multi-level approvals, escalation logic, dynamic notifications, and builder forms.
*   **Key Database Tables:** `workflow_definition`, `workflow_instance`, `workflow_escalation_rule`.
*   **Core API Endpoint:** `/api/${api.version}/workflows/definitions`

## 27. Communication & Notifications
Sends announcements, email alerts, SMS messages, and dynamic in-app push keys.
*   **Key Database Tables:** `announcement`, `notification_log`, `user_notification_preference`.
*   **Core API Endpoint:** `/api/${api.version}/communication/announcements`

## 28. Reports & Analytics
Generates dashboards, turnover graphs, and diversity exports (CSV/PDF/Excel).
*   **Key Database Tables:** Read-only reporting view queries.
*   **Core API Endpoint:** `/api/${api.version}/reports/generate`

## 29. Integration Marketplace
Synchronizes Google Workspace, Microsoft 365, LDAP, active directories, and ERP systems.
*   **Key Database Tables:** `integration_mapping`, `api_token_registry`.
*   **Core API Endpoint:** `/api/${api.version}/integrations`

## 30. Mobile Platform
Enables offline-ready MSS/ESS actions and mobile geolocated clockings.
*   **Key Database Tables:** Synchronized mobile data state buffers.
*   **Core API Endpoint:** `/api/${api.version}/mobile/sync`

## 31. AI & Automation (Future)
Performs CV screening, payroll anomaly flags, chatbot logs, and attrition scoring.
*   **Key Database Tables:** `ai_prediction_model`, `ai_chatbot_log`.
*   **Core API Endpoint:** `/api/${api.version}/ai/query`

## 32. Compliance & Governance
GDPR consent registers, data retention pipelines, and audit logs.
*   **Key Database Tables:** `compliance_consent`, `data_retention_log`, `audit_trail`.
*   **Core API Endpoint:** `/api/${api.version}/compliance/audits`

## 33. Platform Settings
System configurations, currency conversions, localization settings, and branding.
*   **Key Database Tables:** `tenant_setting`, `branding_template`.
*   **Core API Endpoint:** `/api/${api.version}/settings/branding`

## 34. Enterprise Features
Multi-country mapping, legal entity frameworks, rate limiting, and HA failovers.
*   **Key Database Tables:** `rate_limit_policy`, `entity_country_mapping`.
*   **Core API Endpoint:** `/api/${api.version}/enterprise/status`
