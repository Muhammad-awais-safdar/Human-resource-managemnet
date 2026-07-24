-- V31: Localization

CREATE TABLE IF NOT EXISTS tenant_locale_setting (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    default_language    VARCHAR(10) NOT NULL DEFAULT 'en-US',
    time_zone           VARCHAR(50) NOT NULL DEFAULT 'UTC',
    date_format         VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    currency_code       VARCHAR(10) NOT NULL DEFAULT 'USD',
    is_rtl_supported    BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
