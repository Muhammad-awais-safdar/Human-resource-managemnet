-- =============================================
-- V15: Phases 31-34 Schema Enhancements
-- Phase 31: AI & Automation
-- Phase 32: Compliance & Governance
-- Phase 33: Platform Settings
-- Phase 34: Enterprise Features
-- =============================================

-- =============================================
-- PHASE 31: AI & AUTOMATION
-- =============================================
CREATE TABLE IF NOT EXISTS ai_anomaly_flag (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    entity_type     VARCHAR(50)  NOT NULL, -- ATTENDANCE, EXPENSE, TIMESHEET
    entity_id       VARCHAR(36)  NOT NULL,
    severity        VARCHAR(20)  NOT NULL, -- LOW, MEDIUM, HIGH
    reason          VARCHAR(500) NOT NULL,
    detected_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved        BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_ai_anomaly_entity ON ai_anomaly_flag(entity_type, entity_id);

-- =============================================
-- PHASE 32: COMPLIANCE & GOVERNANCE
-- =============================================
CREATE TABLE IF NOT EXISTS gdpr_consent (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    employee_id     VARCHAR(36)  NOT NULL UNIQUE, -- 1-to-1 mapping
    consent_given   BOOLEAN      NOT NULL DEFAULT FALSE,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    action          VARCHAR(50)  NOT NULL, -- INSERT, UPDATE, DELETE, VIEW
    table_name      VARCHAR(100) NOT NULL,
    record_id       VARCHAR(36)  NOT NULL,
    changed_by      VARCHAR(100) NOT NULL, -- email of the user
    old_value       TEXT,                  -- serialised JSON or description
    new_value       TEXT,                  -- serialised JSON or description
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_table ON compliance_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_user  ON compliance_audit_log(changed_by);

-- =============================================
-- PHASE 33: PLATFORM SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS platform_settings (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    company_name    VARCHAR(200) NOT NULL DEFAULT 'Awais HR Corp',
    primary_color   VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
    logo_url        VARCHAR(500),
    support_email   VARCHAR(254) NOT NULL DEFAULT 'support@company.com',
    currency        VARCHAR(10)  NOT NULL DEFAULT 'USD',
    timezone        VARCHAR(50)  NOT NULL DEFAULT 'UTC',
    date_format     VARCHAR(50)  NOT NULL DEFAULT 'yyyy-MM-dd',
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial settings row so it's always queryable
INSERT INTO platform_settings (id, company_name, primary_color, support_email, currency, timezone, date_format)
VALUES ('default-settings-id-001', 'Awais HR Corp', '#6366f1', 'support@company.com', 'USD', 'UTC', 'yyyy-MM-dd')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PHASE 34: ENTERPRISE FEATURES
-- =============================================
CREATE TABLE IF NOT EXISTS api_key (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    employee_id     VARCHAR(36)  NOT NULL,
    name            VARCHAR(100) NOT NULL,
    key_hash        VARCHAR(64)  NOT NULL UNIQUE, -- SHA-256 hash of API key
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tenant_backup_log (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    backup_name     VARCHAR(200) NOT NULL,
    file_size       BIGINT       NOT NULL DEFAULT 0,
    status          VARCHAR(50)  NOT NULL DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_key_hash ON api_key(key_hash);

-- =============================================
-- RESILIENCE SEEDING: Ensure SYSTEM_ADMIN has all 4 core permissions mapped
-- =============================================
INSERT INTO permission (id, name, description)
VALUES ('perm-id-corehr-emp-read', 'corehr:employee:read', 'Read access to employee profiles')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permission (id, name, description)
VALUES ('perm-id-corehr-emp-write', 'corehr:employee:write', 'Write access to employee profiles')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permission (id, name, description)
VALUES ('perm-id-corehr-org-write', 'corehr:org:write', 'Manage organization structure and tree nodes')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permission (id, name, description)
VALUES ('perm-id-corehr-set-write', 'corehr:settings:write', 'Modify white-label tenant branding configurations')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (id, name, description)
VALUES ('role-id-sys-admin', 'SYSTEM_ADMIN', 'Full access administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'SYSTEM_ADMIN'
  AND p.name IN ('corehr:employee:read', 'corehr:employee:write', 'corehr:org:write', 'corehr:settings:write')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Seed standard roles
INSERT INTO role (id, name, description)
VALUES ('role-id-employee', 'EMPLOYEE', 'Standard employee self-service access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (id, name, description)
VALUES ('role-id-manager', 'MANAGER', 'Department supervisor access and approvals')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (id, name, description)
VALUES ('role-id-hr-manager', 'HR_MANAGER', 'Core HR staff and operational management')
ON CONFLICT (name) DO NOTHING;

-- Map EMPLOYEE permissions (corehr:employee:read)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'EMPLOYEE'
  AND p.name = 'corehr:employee:read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map MANAGER permissions (corehr:employee:read)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'MANAGER'
  AND p.name = 'corehr:employee:read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map HR_MANAGER permissions (all corehr permissions)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'HR_MANAGER'
  AND p.name IN ('corehr:employee:read', 'corehr:employee:write', 'corehr:org:write', 'corehr:settings:write')
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS employee_invite (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    email       VARCHAR(100) NOT NULL,
    token       VARCHAR(64)  NOT NULL UNIQUE,
    role_id     VARCHAR(50)  REFERENCES role(id) ON DELETE SET NULL,
    expires_at  TIMESTAMP    NOT NULL,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employee_invite_token ON employee_invite(token);



