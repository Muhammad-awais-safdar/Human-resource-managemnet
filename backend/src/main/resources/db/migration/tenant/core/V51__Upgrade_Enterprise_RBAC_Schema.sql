-- Enterprise Feature-Based RBAC Schema Upgrade
-- Idempotent script for schema enhancements with zero data loss

SET @dbname = DATABASE();

-- 1. Enhance role table
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'role' AND COLUMN_NAME = 'is_system_role') > 0, 'SELECT 1', 'ALTER TABLE role ADD COLUMN is_system_role BOOLEAN DEFAULT FALSE'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'role' AND COLUMN_NAME = 'status') > 0, 'SELECT 1', 'ALTER TABLE role ADD COLUMN status VARCHAR(20) DEFAULT ''ACTIVE'''));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'role' AND COLUMN_NAME = 'created_at') > 0, 'SELECT 1', 'ALTER TABLE role ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'role' AND COLUMN_NAME = 'updated_at') > 0, 'SELECT 1', 'ALTER TABLE role ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Enhance permission table
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'permission' AND COLUMN_NAME = 'module_key') > 0, 'SELECT 1', 'ALTER TABLE permission ADD COLUMN module_key VARCHAR(50) DEFAULT ''CORE_HR'''));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'permission' AND COLUMN_NAME = 'feature_key') > 0, 'SELECT 1', 'ALTER TABLE permission ADD COLUMN feature_key VARCHAR(50) DEFAULT ''EMPLOYEES'''));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'permission' AND COLUMN_NAME = 'action_key') > 0, 'SELECT 1', 'ALTER TABLE permission ADD COLUMN action_key VARCHAR(50) DEFAULT ''READ'''));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'permission' AND COLUMN_NAME = 'ui_label') > 0, 'SELECT 1', 'ALTER TABLE permission ADD COLUMN ui_label VARCHAR(100)'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'permission' AND COLUMN_NAME = 'is_sensitive') > 0, 'SELECT 1', 'ALTER TABLE permission ADD COLUMN is_sensitive BOOLEAN DEFAULT FALSE'));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Enhance role_permission junction
SET @preparedStatement = (SELECT IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'role_permission' AND COLUMN_NAME = 'access_scope') > 0, 'SELECT 1', 'ALTER TABLE role_permission ADD COLUMN access_scope VARCHAR(20) DEFAULT ''COMPANY'''));
PREPARE stmt FROM @preparedStatement; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mark existing system roles
UPDATE role SET is_system_role = TRUE WHERE UPPER(name) IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'HR_MANAGER', 'EMPLOYEE', 'RECRUITER');
