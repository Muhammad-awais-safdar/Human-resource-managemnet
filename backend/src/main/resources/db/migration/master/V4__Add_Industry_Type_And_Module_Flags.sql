-- Migration V4: Add industry_type column and platform module tables
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS industry_type VARCHAR(50) DEFAULT 'GENERAL';

CREATE TABLE IF NOT EXISTS platform_module (
    module_key VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_globally_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_module_override (
    tenant_id VARCHAR(100) NOT NULL,
    module_key VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, module_key)
);
