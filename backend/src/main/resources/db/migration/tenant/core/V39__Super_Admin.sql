-- V39: Super Admin Dashboard

CREATE TABLE IF NOT EXISTS super_admin_tenant_log (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_name     VARCHAR(100) NOT NULL,
    action_type     VARCHAR(50) NOT NULL DEFAULT 'PROVISION', -- PROVISION, SUSPEND, REACTIVATE, DEPOSIT
    details         TEXT,
    performed_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
