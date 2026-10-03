-- Idempotent column additions for Soft Delete Support in MySQL
SET @dbname = DATABASE();

-- 1. leave_request
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'leave_request' AND COLUMN_NAME = 'deleted') > 0, 'SELECT 1', 'ALTER TABLE leave_request ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. attendance_record
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'attendance_record' AND COLUMN_NAME = 'deleted') > 0, 'SELECT 1', 'ALTER TABLE attendance_record ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. candidate_application
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'candidate_application' AND COLUMN_NAME = 'deleted') > 0, 'SELECT 1', 'ALTER TABLE candidate_application ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. support_ticket
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'support_ticket' AND COLUMN_NAME = 'deleted') > 0, 'SELECT 1', 'ALTER TABLE support_ticket ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. expense_claim
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'expense_claim' AND COLUMN_NAME = 'deleted') > 0, 'SELECT 1', 'ALTER TABLE expense_claim ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. resignation
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'resignation' AND COLUMN_NAME = 'deleted') > 0, 'SELECT 1', 'ALTER TABLE resignation ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;
