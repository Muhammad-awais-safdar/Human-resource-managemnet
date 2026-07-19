# Product Release & Versioning Roadmap: Awais HR

This document details the rollout phases, beta testing programs, deployment strategies, deprecation rules, and support processes for **Awais HR**.

---

## 1. Product Launch Timeline

We follow a progressive, risk-mitigated rollout schedule aligned with our core delivery phases:

```mermaid
chronology
    title Awais HR Release Chronology
    2026-09-01 : Alpha Sandbox
    2026-11-01 : Phase 1 Release (Core Platform & Auth)
    2027-01-01 : Phase 2 Release (Core HR & Workforce)
    2027-03-01 : Phase 3 Release (Financials, ATS & Workflows)
    2027-05-01 : Phase 4 Release (Business, LMS & AI Add-ons)
```

---

## 2. Beta Testing Program & Feedback Loops

*   **Closed Beta Phase (SME Focus):** Invite 10 companies across different sectors (2 IT, 3 Retail, 3 Restaurants, 2 Healthcare) to test tenant provisioning, leave approvals, and roster setups under real conditions.
*   **Feedback Integration:** Weekly sync calls with beta administrators. Automatic crash reports and performance metrics are routed to a dedicated internal Slack channel.
*   **Exit Criteria:** No critical data-access bugs, 99.9% uptime over a 30-day period, and API response P95 latency below 200ms.

---

## 3. Rolling Updates & Deployment Strategy

*   **Zero-Downtime Deployments:** Kubernetes rolling updates replace old pod instances gradually. This guarantees uninterrupted API availability.
*   **Database Migrations Rollout:** Flyway migrations must be designed to be backward-compatible (non-destructive):
    *   *Step 1 (Release N):* Add new column, write code to write to both columns, and run backfill scripts.
    *   *Step 2 (Release N+1):* Deprecate and stop reading from old column.
    *   *Step 3 (Release N+2):* Drop old column in a separate database migration.
    *   This prevents application crashes if old pod versions run during the migration window.

---

## 4. API Versioning & Deprecation Policy

*   **Version Format:** URI path versioning: `/api/v{major}` or dynamically mapped path configurations.
*   **Deprecation Cycle:** When a major API version is replaced (e.g., v1 to v2):
    1.  **Announcement:** Send deprecation email to tenant developers and mark endpoints with the `@Deprecated` annotation.
    2.  **Sunset Period:** The old API version remains supported for 12 months.
    3.  **Shutdown:** After 12 months, requests to the old endpoints return an HTTP `410 Gone` error.

---

## 5. Post-Launch Hypercare Protocol

Following a new customer onboarding or a major release, we initiate a **2-week Hypercare Phase**:
*   **Priority Support:** Assign a dedicated Customer Reliability Engineer (CRE) to the tenant.
*   **Monitoring Alerts:** Set up high-frequency Prometheus/Grafana alerts specifically tracking that tenant's database connection pool latency and request error rates.
*   **Daily Review:** Review error logs and API usage daily to proactively identify and resolve performance bottlenecks or UX friction points.
