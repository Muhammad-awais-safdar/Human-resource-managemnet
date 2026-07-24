-- V38: Subscription & Billing Engine

CREATE TABLE IF NOT EXISTS tenant_subscription (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_name       VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE_TIER', -- STARTER, GROWTH, ENTERPRISE_TIER
    billing_cycle   VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, ANNUAL
    seat_count      INT NOT NULL DEFAULT 50,
    amount_usd      NUMERIC(10,2) NOT NULL DEFAULT 499.00,
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- TRIAL, ACTIVE, PAST_DUE, CANCELLED
    trial_ends_at   TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_invoice (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_number  VARCHAR(50) NOT NULL,
    amount_paid     NUMERIC(10,2) NOT NULL DEFAULT 499.00,
    currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
    status          VARCHAR(30) NOT NULL DEFAULT 'PAID',
    invoice_url     VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
