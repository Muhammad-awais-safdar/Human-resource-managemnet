-- V8__Add_Super_Admin_Tenant_Log.sql
-- Create super_admin_tenant_log table in Master database context

CREATE TABLE IF NOT EXISTS super_admin_tenant_log (
    id VARCHAR(50) PRIMARY KEY,
    tenant_name VARCHAR(150) NOT NULL,
    action_type VARCHAR(50) NOT NULL DEFAULT 'PROVISION',
    details TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_super_admin_tenant_log_performed_at ON super_admin_tenant_log(performed_at DESC);
