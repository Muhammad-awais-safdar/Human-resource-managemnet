-- V29: Developer Platform

CREATE TABLE IF NOT EXISTS webhook_subscription (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_type  VARCHAR(100) NOT NULL, -- employee.created, leave.approved, etc.
    target_url  VARCHAR(500) NOT NULL,
    secret_key  VARCHAR(255) NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
