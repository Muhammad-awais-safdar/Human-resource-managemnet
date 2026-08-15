-- Master Schema Migration V7: Search, Filtering & Query Performance Indexing
-- Prevents table scans for tenant lookups, module feature flag queries, and platform security audits

CREATE INDEX IF NOT EXISTS idx_tenant_status ON tenant (status);
CREATE INDEX IF NOT EXISTS idx_tenant_subdomain ON tenant (subdomain);
CREATE INDEX IF NOT EXISTS idx_tenant_industry_type ON tenant (industry_type);
CREATE INDEX IF NOT EXISTS idx_tenant_module_override_lookup ON tenant_module_override (tenant_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_subscription_tenant_id ON subscription (tenant_id);
