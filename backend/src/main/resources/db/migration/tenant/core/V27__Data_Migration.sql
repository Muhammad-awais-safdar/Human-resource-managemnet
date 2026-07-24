-- V27: Data Migration

CREATE TABLE IF NOT EXISTS data_migration_job (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source_system       VARCHAR(100) NOT NULL DEFAULT 'CSV_IMPORT', -- CSV_IMPORT, EXCEL, LEGACY_HRIS
    target_entity       VARCHAR(100) NOT NULL DEFAULT 'EMPLOYEE',
    total_records       INT NOT NULL DEFAULT 0,
    successful_records  INT NOT NULL DEFAULT 0,
    failed_records      INT NOT NULL DEFAULT 0,
    status              VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- IN_PROGRESS, COMPLETED, FAILED
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS migration_record (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    job_id          VARCHAR(36) NOT NULL REFERENCES data_migration_job(id) ON DELETE CASCADE,
    raw_data        TEXT,
    error_log       TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
