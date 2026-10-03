-- V37: Enterprise Admin

CREATE TABLE IF NOT EXISTS enterprise_admin_setting (
    id                      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    maintenance_mode        BOOLEAN NOT NULL DEFAULT FALSE,
    feature_flags_json      TEXT NOT NULL,
    license_type            VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE_UNLIMITED',
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
