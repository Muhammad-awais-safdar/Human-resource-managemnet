-- V36: Mobile Enterprise

CREATE TABLE IF NOT EXISTS mobile_device_registration (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_name     VARCHAR(100) NOT NULL,
    os_type         VARCHAR(50) NOT NULL DEFAULT 'ANDROID', -- ANDROID, IOS
    push_token      VARCHAR(255),
    is_biometric    BOOLEAN NOT NULL DEFAULT TRUE,
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    registered_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
