-- V33: Business Continuity

CREATE TABLE IF NOT EXISTS disaster_recovery_backup (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    backup_name     VARCHAR(100) NOT NULL,
    backup_type     VARCHAR(50) NOT NULL DEFAULT 'AUTOMATED', -- AUTOMATED, MANUAL, SNAPSHOT
    size_bytes      BIGINT NOT NULL DEFAULT 1048576,
    status          VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
