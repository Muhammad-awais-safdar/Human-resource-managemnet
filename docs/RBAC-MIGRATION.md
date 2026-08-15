# RBAC Database Migration & Data Preservation Plan

## 1. Migration Strategy Overview
To ensure zero downtime and 100% backward compatibility for existing enterprise tenants, database migrations use Flyway scripts with idempotent idempotent statements (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`). Existing user roles, employee role assignments, and permission mappings are preserved intact.

---

## 2. Migration Execution Flow

```text
Existing RBAC Tables (role, permission, role_permission, employee_role)
                     ↓
Flyway Migration V5__Upgrade_Enterprise_RBAC_Schema.sql
                     ↓
Safely Add Metadata Columns (is_system_role, status, module_key, ui_label, is_sensitive)
                     ↓
Seed Standard Business Permission Labels & Categorization
                     ↓
Validate Data Integrity & Foreign Keys
                     ↓
Active System Operational
```

---

## 3. Flyway Migration Script (`V5__Upgrade_Enterprise_RBAC_Schema.sql`)

```sql
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

-- Mark standard system roles
UPDATE role SET is_system_role = TRUE WHERE name IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'HR_MANAGER', 'EMPLOYEE', 'RECRUITER');
```
