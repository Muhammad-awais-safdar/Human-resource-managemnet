-- V28: API Marketplace

CREATE TABLE IF NOT EXISTS api_key (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key_name    VARCHAR(100) NOT NULL,
    api_key     VARCHAR(255) NOT NULL UNIQUE,
    status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
