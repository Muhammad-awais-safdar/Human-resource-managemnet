-- V60: Multi-Tier Expense Approval Workflow & Audit Log Schema

SET @c1 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'expense_claim' AND column_name = 'tier_level');
SET @s1 := IF(@c1 = 0, 'ALTER TABLE expense_claim ADD COLUMN tier_level INT NOT NULL DEFAULT 1', 'SELECT 1');
PREPARE stmt1 FROM @s1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @c2 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'expense_claim' AND column_name = 'approved_by');
SET @s2 := IF(@c2 = 0, 'ALTER TABLE expense_claim ADD COLUMN approved_by VARCHAR(100)', 'SELECT 1');
PREPARE stmt2 FROM @s2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SET @c3 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'expense_claim' AND column_name = 'rejection_reason');
SET @s3 := IF(@c3 = 0, 'ALTER TABLE expense_claim ADD COLUMN rejection_reason VARCHAR(255)', 'SELECT 1');
PREPARE stmt3 FROM @s3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

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

SET @i1 := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'expense_claim' AND index_name = 'idx_expense_claim_emp');
SET @si1 := IF(@i1 = 0, 'CREATE INDEX idx_expense_claim_emp ON expense_claim (employee_id, status)', 'SELECT 1');
PREPARE stmt_i1 FROM @si1;
EXECUTE stmt_i1;
DEALLOCATE PREPARE stmt_i1;

SET @i2 := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'expense_approval_log' AND index_name = 'idx_expense_log_claim');
SET @si2 := IF(@i2 = 0, 'CREATE INDEX idx_expense_log_claim ON expense_approval_log (expense_claim_id)', 'SELECT 1');
PREPARE stmt_i2 FROM @si2;
EXECUTE stmt_i2;
DEALLOCATE PREPARE stmt_i2;
