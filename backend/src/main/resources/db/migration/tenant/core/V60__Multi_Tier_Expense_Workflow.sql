-- V60: Multi-Tier Expense Approval Workflow & Audit Log Schema

ALTER TABLE expense_claim ADD COLUMN IF NOT EXISTS tier_level INT NOT NULL DEFAULT 1;
ALTER TABLE expense_claim ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
ALTER TABLE expense_claim ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(255);

CREATE TABLE IF NOT EXISTS expense_approval_log (
    id                VARCHAR(36) PRIMARY KEY,
    expense_claim_id  VARCHAR(50) NOT NULL,
    tier              INT NOT NULL,
    action            VARCHAR(30) NOT NULL, -- SUBMITTED, PENDING_TIER_2, PENDING_CFO, APPROVED, REJECTED, DISBURSED
    actor_email       VARCHAR(100) NOT NULL,
    comment           VARCHAR(255),
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expense_log_claim FOREIGN KEY (expense_claim_id) REFERENCES expense_claim(id) ON DELETE CASCADE
);

CREATE INDEX idx_expense_claim_emp ON expense_claim (employee_id, status);
CREATE INDEX idx_expense_log_claim ON expense_approval_log (expense_claim_id);
