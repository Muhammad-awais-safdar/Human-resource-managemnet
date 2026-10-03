-- V13: Enhancements for Phases 21 to 25 (Expenses, Travel, Timesheets, Help Desk, and Documents)

SET @dbname = DATABASE();

-- 1. Phase 21: Expense claim receipt attachment support
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'expense_claim' AND COLUMN_NAME = 'receipt_url') > 0, 'SELECT 1', 'ALTER TABLE expense_claim ADD COLUMN receipt_url VARCHAR(255)'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Phase 22: Travel request purpose and approval context
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'travel_request' AND COLUMN_NAME = 'purpose') > 0, 'SELECT 1', 'ALTER TABLE travel_request ADD COLUMN purpose VARCHAR(255)'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'travel_request' AND COLUMN_NAME = 'approved_by') > 0, 'SELECT 1', 'ALTER TABLE travel_request ADD COLUMN approved_by VARCHAR(50)'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Phase 23: Resource Project Allocations and Timesheet statuses
CREATE TABLE IF NOT EXISTS project_allocation (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES project(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'timesheet_log' AND COLUMN_NAME = 'status') > 0, 'SELECT 1', 'ALTER TABLE timesheet_log ADD COLUMN status VARCHAR(20) DEFAULT ''PENDING'' NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Phase 24: Support ticket assignee, priority, and Knowledge Base Articles
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'support_ticket' AND COLUMN_NAME = 'assigned_to') > 0, 'SELECT 1', 'ALTER TABLE support_ticket ADD COLUMN assigned_to VARCHAR(50) REFERENCES employee(id) ON DELETE SET NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'support_ticket' AND COLUMN_NAME = 'priority') > 0, 'SELECT 1', 'ALTER TABLE support_ticket ADD COLUMN priority VARCHAR(20) DEFAULT ''MEDIUM'' NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS knowledge_base_article (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Phase 25: Document management signature verification and expiry tracking
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'document_record' AND COLUMN_NAME = 'expiry_date') > 0, 'SELECT 1', 'ALTER TABLE document_record ADD COLUMN expiry_date DATE'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'document_record' AND COLUMN_NAME = 'signed') > 0, 'SELECT 1', 'ALTER TABLE document_record ADD COLUMN signed BOOLEAN DEFAULT FALSE NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'document_record' AND COLUMN_NAME = 'signature_data') > 0, 'SELECT 1', 'ALTER TABLE document_record ADD COLUMN signature_data TEXT'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;
