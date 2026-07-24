-- V44: Smart Notification Center

CREATE TABLE IF NOT EXISTS user_notification_preference (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_email      VARCHAR(100) NOT NULL,
    email_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_notification (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    recipient_email VARCHAR(100) NOT NULL,
    title           VARCHAR(150) NOT NULL,
    message         TEXT NOT NULL,
    category        VARCHAR(50) NOT NULL DEFAULT 'SYSTEM', -- APPROVAL, PAYROLL, LEAVE, SYSTEM, ANNOUNCEMENT
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
