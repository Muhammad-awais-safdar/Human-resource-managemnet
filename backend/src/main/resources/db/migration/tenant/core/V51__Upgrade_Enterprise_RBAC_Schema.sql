-- Enterprise Feature-Based RBAC Schema Upgrade
-- Idempotent script for schema enhancements with zero data loss

-- 1. Enhance role table
ALTER TABLE role ADD COLUMN IF NOT EXISTS is_system_role BOOLEAN DEFAULT FALSE;
ALTER TABLE role ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE role ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE role ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Enhance permission table
ALTER TABLE permission ADD COLUMN IF NOT EXISTS module_key VARCHAR(50) DEFAULT 'CORE_HR';
ALTER TABLE permission ADD COLUMN IF NOT EXISTS feature_key VARCHAR(50) DEFAULT 'EMPLOYEES';
ALTER TABLE permission ADD COLUMN IF NOT EXISTS action_key VARCHAR(50) DEFAULT 'READ';
ALTER TABLE permission ADD COLUMN IF NOT EXISTS ui_label VARCHAR(100);
ALTER TABLE permission ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT FALSE;

-- 3. Enhance role_permission junction
ALTER TABLE role_permission ADD COLUMN IF NOT EXISTS access_scope VARCHAR(20) DEFAULT 'COMPANY';

-- Mark existing system roles
UPDATE role SET is_system_role = TRUE WHERE UPPER(name) IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'HR_MANAGER', 'EMPLOYEE', 'RECRUITER');
