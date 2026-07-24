-- V48: Tenant Analytics & SaaS Metrics

CREATE TABLE IF NOT EXISTS tenant_usage_metric (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id       VARCHAR(36) NOT NULL,
    active_users    INT NOT NULL DEFAULT 0,
    api_calls_count INT NOT NULL DEFAULT 0,
    storage_mb      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    mrr_amount      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    recorded_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_churn_risk_log (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_name     VARCHAR(100) NOT NULL,
    churn_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- 0.00 to 100.00%
    risk_level      VARCHAR(20) NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
