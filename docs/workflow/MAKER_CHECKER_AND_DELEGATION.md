# Awais HR — Maker-Checker & Approval Delegation Framework

## 1. Overview

Phase 6 implements enterprise two-person integrity (**Maker-Checker**) and **Time-Bound Approval Delegation** mechanisms to secure critical financial and organizational changes (e.g. Salary Revisions, Bank Disbursements, Role Promotions).

---

## 2. Maker-Checker Framework

### Core Principles
1. **Maker (Initiator)** submits a sensitive change request (`maker_checker_request`). Status becomes `PENDING_CHECKER_APPROVAL`.
2. **Checker (Approver)** reviews and approves/rejects the request.
3. **Maker != Checker Enforcement**: The user who created the request is strictly blocked from acting as the checker (`SecurityException` thrown on violation attempt).
4. **Permission Enforcement**: Checker must hold relevant permissions (`payroll:salary:process`, `payroll:salary:approve`, `role:manage`, `salary:write`).

### State Transitions
```
[MAKER SUBMITS] ──► PENDING_CHECKER_APPROVAL
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
     [CHECKER APPROVES]          [CHECKER REJECTS]
             │                           │
             ▼                           ▼
          APPROVED                    REJECTED
```

---

## 3. Approval Delegation Framework

### Core Principles
1. **Time-Bound**: Delegations specify `effective_from` and `effective_until` timestamps.
2. **Scope-Aware**: Delegations can be restricted to specific modules (`ALL`, `LEAVE`, `EXPENSE`, `PAYROLL`, `SALARY`).
3. **Self-Delegation Guard**: A user cannot delegate authority to themselves.
4. **Revocable**: Delegations can be revoked at any time by the delegator or administrator.

---

## 4. REST APIs Reference

### Maker-Checker Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/suite/maker-checker/requests` | Create new Maker request |
| `POST` | `/api/v1/suite/maker-checker/requests/{id}/approve` | Checker approves request |
| `POST` | `/api/v1/suite/maker-checker/requests/{id}/reject` | Checker rejects request |
| `GET` | `/api/v1/suite/maker-checker/pending` | List pending requests for checker |
| `GET` | `/api/v1/suite/maker-checker/my-requests` | List requests created by maker |

### Approval Delegation Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/suite/delegation/create` | Create a time-bound delegation |
| `POST` | `/api/v1/suite/delegation/{id}/revoke` | Revoke active delegation |
| `GET` | `/api/v1/suite/delegation/my-delegations` | List delegations created by user |
| `GET` | `/api/v1/suite/delegation/assigned-to-me` | List active delegations assigned to user |
