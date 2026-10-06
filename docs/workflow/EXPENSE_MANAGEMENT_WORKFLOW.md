# Awais HR — Multi-Tier Expense Management Workflow Architecture

## 1. Overview

Phase 12 refactors **Expense Management** into a multi-tier threshold approval state machine with self-approval guards and an append-only approval log (`expense_approval_log`).

---

## 2. Approval Tier Thresholds

| Tier | Amount Threshold | Required Approver Role | Next State Transition |
|---|---|---|---|
| **Tier 1** | Amount $\le$ $500.00 | Line Manager | `PENDING_TIER_1` ──► `APPROVED` |
| **Tier 2** | $500.00 < Amount $\le$ $2,500.00 | Line Manager + Finance Manager | `PENDING_TIER_1` ──► `PENDING_TIER_2` ──► `APPROVED` |
| **Tier 3** | Amount > $2,500.00 | Line Manager + Finance + CFO | `PENDING_TIER_1` ──► `PENDING_TIER_2` ──► `PENDING_CFO` ──► `APPROVED` |

---

## 3. Core Security & Business Guarantees

1. **Self-Approval Protection**: Applicants CANNOT approve or reject their own expense claims (`IllegalArgumentException` thrown).
2. **Immutability After Approval**: Approved (`APPROVED`) or disbursed (`DISBURSED`) claims reject deletion or state modification.
3. **Disbursement Workflow**: Transition from `APPROVED` ──► `DISBURSED` logs step-by-step audit records.
4. **Declarative Audit**: Annotated with `@Auditable(action = "EXPENSE_SUBMIT", entity = "ExpenseClaim")` and `@Auditable(action = "EXPENSE_APPROVE", entity = "ExpenseClaim")`.

---

## 4. Schema Reference (`V60__Multi_Tier_Expense_Workflow.sql`)

### `expense_claim` Extensions
- `tier_level` (INT NOT NULL DEFAULT 1)
- `approved_by` (VARCHAR(100))
- `rejection_reason` (VARCHAR(255))

### `expense_approval_log`
- `id` (VARCHAR(36) PRIMARY KEY)
- `expense_claim_id` (VARCHAR(50) FOREIGN KEY)
- `tier` (INT NOT NULL)
- `action` (VARCHAR(30) NOT NULL)
- `actor_email` (VARCHAR(100) NOT NULL)
- `comment` (VARCHAR(255))
- `created_at` (TIMESTAMP)
