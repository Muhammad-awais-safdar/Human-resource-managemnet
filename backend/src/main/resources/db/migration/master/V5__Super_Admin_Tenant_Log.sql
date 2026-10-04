-- V5: Super Admin Tenant Audit Log Table for Master Database
CREATE TABLE IF NOT EXISTS super_admin_tenant_log (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_name     VARCHAR(100) NOT NULL,
    action_type     VARCHAR(50) NOT NULL DEFAULT 'PROVISION',
    details         TEXT,
    performed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
