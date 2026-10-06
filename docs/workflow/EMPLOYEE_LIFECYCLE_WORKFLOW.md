# Awais HR — Employee Lifecycle Management Architecture

## 1. Overview

Phase 9 implements a central **Employee Lifecycle State Machine** to manage employee status transitions from `ONBOARDING` through `PROBATION`, `PROMOTION`, `TRANSFER`, `SUSPENSION`, and `OFFBOARDING`.

---

## 2. Supported Lifecycle States & Event Types

### Lifecycle States
- `INVITED`: Employee account created and invite token dispatched.
- `PROBATION`: Newly joined employee undergoing evaluation.
- `ACTIVE`: Fully confirmed employee.
- `PROMOTED`: Elevated role or grade transition.
- `TRANSFERRED`: Moved across departments or organizational units.
- `SUSPENDED`: Temporarily suspended pending HR review.
- `NOTICE_PERIOD`: Exit clearance initiated; offboarding in progress.
- `TERMINATED`: Employment relationship severed.
- `RESIGNED`: Voluntary departure completed.
- `RETIRED`: Superannuation completed.

### Event Types
- `ONBOARDING`, `PROBATION_CONFIRMATION`, `PROMOTION`, `DEPARTMENT_TRANSFER`, `ROLE_CHANGE`, `SALARY_REVISION`, `SUSPENSION`, `EXIT_CLEARANCE_INITIATED`, `OFFBOARDING_COMPLETED`.

---

## 3. Schema Reference (`V57__Employee_Lifecycle_Hardening.sql`)

### `employee_lifecycle_event`
- `id` (VARCHAR(36) PRIMARY KEY)
- `employee_id` (VARCHAR(50) NOT NULL)
- `event_type` (VARCHAR(50) NOT NULL)
- `previous_state` (VARCHAR(50))
- `new_state` (VARCHAR(50) NOT NULL)
- `effective_date` (DATE NOT NULL)
- `reason` (VARCHAR(255))
- `initiated_by` (VARCHAR(100) NOT NULL)
- `approved_by` (VARCHAR(100))
- `status` (VARCHAR(30) NOT NULL DEFAULT 'COMPLETED')
- `created_at` (TIMESTAMP)

---

## 4. Operational & Audit Features

1. **State Machine Validation**: Rejects invalid states and prevents direct reactivation of `TERMINATED` employees without explicit rehiring workflows.
2. **Timeline Synchronization**: Every transition automatically appends a record to `employee_timeline` and `employee_lifecycle_event`.
3. **Declarative Audit**: Tagged with `@Auditable(action = "EMPLOYEE_LIFECYCLE_TRANSITION", entity = "Employee")`.
4. **Employee 360 View**: Aggregate timeline and lifecycle event history exposed via `getEmployee360(employeeId)`.
