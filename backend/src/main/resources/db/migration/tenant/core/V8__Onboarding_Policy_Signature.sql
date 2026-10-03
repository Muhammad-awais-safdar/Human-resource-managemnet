-- Phase 11: Compliance Policy Signatures
CREATE TABLE IF NOT EXISTS onboarding_policy_signature (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    document VARCHAR(100) NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Phase 12: Resignation Extensions
SET @dbname = DATABASE();
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'resignation' AND COLUMN_NAME = 'exit_interview_feedback') > 0, 'SELECT 1', 'ALTER TABLE resignation ADD COLUMN exit_interview_feedback TEXT'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'resignation' AND COLUMN_NAME = 'final_settlement_amount') > 0, 'SELECT 1', 'ALTER TABLE resignation ADD COLUMN final_settlement_amount NUMERIC(12,2) DEFAULT 0.00'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;
