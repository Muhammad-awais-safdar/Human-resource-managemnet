# Awais HR — Recruitment & ATS Pipeline Workflow Architecture

## 1. Overview

Phase 15 refactors **Recruitment & Applicant Tracking System (ATS)** into a multi-stage candidate pipeline (`APPLIED`, `SCREENING`, `INTERVIEW_SCHEDULED`, `TECHNICAL_EVALUATION`, `OFFER_EXTENDED`, `HIRED`, `REJECTED`, `WITHDRAWN`) with **Maker-Checker Dual Control (`Maker != Checker`)** for job requisitions and automated provision into Employee Lifecycle Management.

---

## 2. Job Requisition & ATS Pipeline State Machines

### A. Job Requisition Lifecycle
```
DRAFT ──► PENDING_APPROVAL ──► PUBLISHED / OPEN ──► CLOSED / CANCELLED
```

### B. Candidate ATS Pipeline
```
APPLIED ──► SCREENING ──► INTERVIEW_SCHEDULED ──► TECHNICAL_EVALUATION ──► OFFER_EXTENDED ──► HIRED
   │           │                │                        │                     │
   └──► REJECTED / WITHDRAWN ───┴────────────────────────┴─────────────────────┘
```

---

## 3. Core Security & Business Guarantees

1. **Maker-Checker Dual Control**: The creator of a job requisition (`creatorEmail`) CANNOT approve or open the requisition (`approverEmail`). Violations throw `IllegalArgumentException`.
2. **Automated Employee Provisioning**: When a candidate transitions to `HIRED`, the system automatically provisions an employee record with status `PROBATION` and records a lifecycle event in `employee_lifecycle_event`.
3. **Stage Transition Audit Log**: Candidate stage movements are recorded in `candidate_stage_log`.
4. **Declarative Audit**: Tagged with `@Auditable(action = "REQUISITION_CREATE", entity = "JobRequisition")`, `@Auditable(action = "REQUISITION_APPROVE", entity = "JobRequisition")`, and `@Auditable(action = "CANDIDATE_STAGE_UPDATE", entity = "CandidateApplication")`.

---

## 4. Schema Reference (`V63__Recruitment_ATS_Workflow.sql`)

### `job_requisition` Extensions
- `created_by` (VARCHAR(100))
- `approved_by` (VARCHAR(100))

### `candidate_stage_log`
- `id` (VARCHAR(36) PRIMARY KEY)
- `candidate_id` (VARCHAR(50) FOREIGN KEY)
- `previous_stage`, `new_stage` (VARCHAR(30))
- `actor_email` (VARCHAR(100))
- `comment` (VARCHAR(255))
- `created_at` (TIMESTAMP)
