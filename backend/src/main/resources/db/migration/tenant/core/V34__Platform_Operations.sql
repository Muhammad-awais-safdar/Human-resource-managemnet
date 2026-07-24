-- V34: Platform Operations

CREATE TABLE IF NOT EXISTS platform_operation_log (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    operation_name  VARCHAR(100) NOT NULL,
    module_name     VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    execution_time_ms INT NOT NULL DEFAULT 15,
    status          VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
