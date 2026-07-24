-- V30: Marketplace

CREATE TABLE IF NOT EXISTS marketplace_plugin (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plugin_name     VARCHAR(100) NOT NULL,
    vendor          VARCHAR(100) NOT NULL DEFAULT 'COMMUNITY',
    version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    is_installed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
