# Awais HR — Enterprise Workflow Engine Documentation

## 1. Overview & Architecture

The **Awais HR Workflow Engine** provides a lightweight, idempotent, database-backed state machine for managing business approval lifecycles across HR modules (e.g., Leave, Salary, Payroll, Expenses, Recruitment).

```
Business Resource (Leave / Expense / Salary)
       │
       ▼
WorkflowEngineService.startWorkflow(...)
       │
       ▼
Workflow Instance (State: IN_PROGRESS, Step: 1)
       │
       ├── ApproverResolver (Resolves MANAGER / ROLE / HR / DYNAMIC)
       ├── AuthorizationService Integration (Permission & Scope check)
       └── Self-Approval Guard (Requester != Approver)
       │
       ▼
Workflow Task (State: PENDING)
       │
       ├── Action: APPROVE ──► Next Step OR Completed (State: APPROVED)
       ├── Action: REJECT  ──► Terminated (State: REJECTED)
       ├── Action: RETURN  ──► Returned for Revision (State: RETURNED)
       └── Action: CANCEL  ──► Cancelled by Initiator (State: CANCELLED)
       │
       ▼
Workflow Action History (Immutable Audit Log)
```

---

## 2. Core Entities & Schema (`V53__Enterprise_Workflow_Engine_Foundation.sql`)

1. **`workflow_definition`**: Stores reusable workflow definitions (`LEAVE_APPROVAL`, `EXPENSE_APPROVAL`, `SALARY_CHANGE`, `PAYROLL_APPROVAL`).
2. **`workflow_version`**: Supports versioned workflow configurations so active historical instances remain unaffected by admin policy changes.
3. **`workflow_step`**: Defines step order, approver resolution type (`MANAGER`, `DEPARTMENT_HEAD`, `ROLE`, `HR`, `FINANCE`, `CFO`, `RESOURCE_OWNER`), required permissions, and scopes.
4. **`workflow_instance`**: Tracks running workflow executions for specific domain resources.
5. **`workflow_task`**: Contains actionable pending approval tasks assigned to specific employees or roles.
6. **`workflow_action_history`**: Maintains audit trail of every state transition, actor, timestamp, and comment.

---

## 3. Key Guarantees & Security

- **Self-Approval Protection**: Requesters are strictly prohibited from approving their own workflow requests (`initiator != actor`).
- **Authorization Integration**: Approvers must possess both assigned task responsibility AND active `AuthorizationService` permissions (`<module>:<resource>:approve`).
- **Idempotency & Concurrency**: Atomic SQL update queries prevent race conditions and duplicate approvals.
- **Database-per-Tenant Isolation**: Workflow execution dynamically inherits current tenant datasource context.

---

## 4. REST API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/suite/workflow/start` | Initiate a new workflow instance |
| `POST` | `/api/v1/suite/workflow/instances/{id}/approve` | Approve active pending task |
| `POST` | `/api/v1/suite/workflow/instances/{id}/reject` | Reject active pending task |
| `POST` | `/api/v1/suite/workflow/instances/{id}/return` | Return pending task for revision |
| `POST` | `/api/v1/suite/workflow/instances/{id}/cancel` | Cancel active workflow instance |
| `GET` | `/api/v1/suite/workflow/pending-tasks` | List pending approval tasks for user |
| `GET` | `/api/v1/suite/workflow/instances/{id}/history` | Get audit action history |
| `GET` | `/api/v1/suite/workflow/instances/{id}/status` | Query current instance status |
