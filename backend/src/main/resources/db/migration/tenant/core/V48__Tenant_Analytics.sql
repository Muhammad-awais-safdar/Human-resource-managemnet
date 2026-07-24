-- V48: Tenant Analytics & SaaS Metrics

CREATE TABLE IF NOT EXISTS tenant_usage_metric (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_subdomain VARCHAR(100) NOT NULL,
    active_users    INT NOT NULL DEFAULT 1,
    monthly_users   INT NOT NULL DEFAULT 1,
    api_calls_count INT NOT NULL DEFAULT 100,
    storage_mb      NUMERIC(10,2) NOT NULL DEFAULT 10.50,
    recorded_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_health_score (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_subdomain VARCHAR(100) NOT NULL,
    health_score    INT NOT NULL DEFAULT 95, -- 0 to 100
    churn_risk_level VARCHAR(30) NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
