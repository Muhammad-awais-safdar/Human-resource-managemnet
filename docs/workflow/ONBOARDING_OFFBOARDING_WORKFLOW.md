# Awais HR — Onboarding & Offboarding Cross-Department Workflow Architecture

## 1. Overview

Phase 16 refactors **Onboarding & Offboarding** into cross-department clearance workflows (IT, HR, Finance, Facilities) with lifecycle transition guards.

---

## 2. Onboarding & Offboarding State Machines

### A. Onboarding State Machine
```
INITIATED ──► DOCUMENTATION_PENDING ──► IT_PROVISIONING ──► HR_ORIENTATED ──► COMPLETED
```
- Completing onboarding transitions employee lifecycle status from `PROBATION` ──► `ACTIVE`.

### B. Offboarding State Machine
```
INITIATED ──► CLEARANCE_PENDING ──► IT_DEPROVISIONED ──► FINAL_SETTLEMENT ──► COMPLETED
```
- Initiating offboarding transitions employee lifecycle status from `ACTIVE` ──► `NOTICE_PERIOD`.
- Completing offboarding transitions employee lifecycle status from `NOTICE_PERIOD` ──► `TERMINATED`.

---

## 3. Core Security & Business Guarantees

1. **Cross-Department Clearance Guard**: Offboarding CANNOT be finalized if any IT, HR, Finance, or Facilities clearance task remains in `PENDING` status (`IllegalStateException` thrown).
2. **Automated Lifecycle Integration**: State changes automatically write to `employee_lifecycle_event` for SOC 2 auditability.
3. **Declarative Audit**: Tagged with `@Auditable(action = "ONBOARDING_INITIATE", entity = "EmployeeOnboarding")`, `@Auditable(action = "OFFBOARDING_INITIATE", entity = "EmployeeOffboarding")`, and `@Auditable(action = "OFFBOARDING_CLEARANCE_COMPLETE", entity = "EmployeeOffboarding")`.

---

## 4. Schema Reference (`V64__Onboarding_Offboarding_Workflow.sql`)

### `employee_onboarding`
- `id` (VARCHAR(36) PRIMARY KEY)
- `employee_id` (VARCHAR(50) FOREIGN KEY)
- `status` (VARCHAR(30))
- `start_date` (DATE)

### `employee_offboarding`
- `id` (VARCHAR(36) PRIMARY KEY)
- `employee_id` (VARCHAR(50) FOREIGN KEY)
- `status` (VARCHAR(30))
- `resignation_date`, `last_working_day` (DATE)

### `cross_dept_clearance_task`
- `id` (VARCHAR(36) PRIMARY KEY)
- `workflow_type` (`ONBOARDING` or `OFFBOARDING`)
- `reference_id` (VARCHAR(36))
- `department` (`IT`, `HR`, `FINANCE`, `FACILITIES`)
- `task_name` (VARCHAR(150))
- `status` (`PENDING`, `COMPLETED`, `WAIVED`)
