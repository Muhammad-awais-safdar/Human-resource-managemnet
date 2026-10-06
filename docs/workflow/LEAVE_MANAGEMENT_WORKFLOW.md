# Awais HR — Leave Management Workflow & Balance Ledger Architecture

## 1. Overview

Phase 8 integrates **Leave Management** with the enterprise **Workflow Engine** and an atomic **Balance Ledger (`leave_balance_ledger`)** to ensure financial and operational compliance for all employee leave requests.

---

## 2. Core Security & Business Guarantees

1. **Double-Booking Overlap Prevention**: The system blocks any submission if an active (`PENDING`, `SUBMITTED`, `APPROVED`) leave request exists for the same employee overlapping with requested dates.
2. **Atomic Balance Ledger**: Balances are calculated via `employee_leave_balance` and audited step-by-step in `leave_balance_ledger` with transaction types:
   - `ACCRUAL`: Annual/monthly quota grants.
   - `DEDUCTION`: Deductions applied upon leave approval.
   - `REVERSAL`: Reversals credited back if an approved leave is cancelled/revoked.
   - `ADJUSTMENT`: Manual HR adjustments.
3. **State Transitions**:
   - `PENDING` ──► `APPROVED` (Triggers `DEDUCTION` in `leave_balance_ledger`)
   - `APPROVED` ──► `CANCELLED` / `REVOKED` (Triggers `REVERSAL` in `leave_balance_ledger`)
4. **Self-Approval Protection**: Approvers cannot approve their own leave requests (`IllegalArgumentException` thrown).

---

## 3. Schema Reference (`V56__Leave_Workflow_And_Balance_Ledger.sql`)

### `employee_leave_balance`
- `id` (VARCHAR(36) PRIMARY KEY)
- `employee_id` (VARCHAR(50) NOT NULL)
- `leave_policy_id` (VARCHAR(50) NOT NULL)
- `year` (INT NOT NULL)
- `allocated_days` (DECIMAL(5,2))
- `used_days` (DECIMAL(5,2))
- `pending_days` (DECIMAL(5,2))
- `remaining_days` (DECIMAL(5,2))

### `leave_balance_ledger`
- `id` (VARCHAR(36) PRIMARY KEY)
- `employee_id` (VARCHAR(50) NOT NULL)
- `leave_policy_id` (VARCHAR(50) NOT NULL)
- `transaction_type` (VARCHAR(30) NOT NULL)
- `days` (DECIMAL(5,2) NOT NULL)
- `reference_id` (VARCHAR(50))
- `reason` (VARCHAR(255))
- `performed_by` (VARCHAR(100))
- `created_at` (TIMESTAMP)

---

## 4. REST APIs Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/leave/policies` | Get active leave policies |
| `POST` | `/api/v1/leave/policies` | Create leave policy (HR Admin) |
| `GET` | `/api/v1/leave/balances` | Fetch employee's leave balance ledger |
| `GET` | `/api/v1/leave/requests` | List leave requests (Scoped by RBAC) |
| `POST` | `/api/v1/leave/requests` | Submit new leave request |
| `PUT` | `/api/v1/leave/requests/{id}/status` | Approve or reject leave request |
| `DELETE` | `/api/v1/leave/requests/{id}` | Delete/cancel leave request |
