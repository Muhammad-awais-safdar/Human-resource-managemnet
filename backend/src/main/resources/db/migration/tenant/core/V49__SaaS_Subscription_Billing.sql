-- V49__SaaS_Subscription_Billing.sql
-- Master & Tenant Schema setup for Enterprise SaaS Subscription & Billing Engine (Payment Domain 1)

CREATE TABLE IF NOT EXISTS subscription_plan (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    base_price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    per_seat_price_usd NUMERIC(12, 2) DEFAULT 10.00,
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    max_employees INT DEFAULT 50,
    max_storage_gb INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS billing_credit_note (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(100) NOT NULL,
    credit_note_number VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    reason TEXT,
    status VARCHAR(30) DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS billing_refund (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(100) NOT NULL,
    invoice_id VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    provider_refund_id VARCHAR(255),
    status VARCHAR(30) DEFAULT 'PROCESSED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_usage_metric (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    quantity BIGINT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed Expert Product & Market Analyst Recommended Default 3 Subscription Tiers
INSERT INTO subscription_plan (code, name, base_price_usd, per_seat_price_usd, billing_cycle, max_employees, max_storage_gb)
VALUES 
('STARTER', 'Starter HR', 49.00, 4.00, 'MONTHLY', 15, 25),
('PROFESSIONAL', 'Growth Professional', 199.00, 7.00, 'MONTHLY', 50, 100),
('ENTERPRISE', 'Enterprise Suite', 499.00, 10.00, 'MONTHLY', 100, 500)
ON DUPLICATE KEY UPDATE 
base_price_usd = VALUES(base_price_usd),
per_seat_price_usd = VALUES(per_seat_price_usd),
max_employees = VALUES(max_employees),
max_storage_gb = VALUES(max_storage_gb),
name = VALUES(name);
