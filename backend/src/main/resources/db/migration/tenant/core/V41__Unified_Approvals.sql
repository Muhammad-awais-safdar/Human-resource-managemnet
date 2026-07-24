-- V41: Unified Approvals Inbox

CREATE TABLE IF NOT EXISTS approval_delegation (
    id                      VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    delegator_email         VARCHAR(100) NOT NULL,
    delegatee_email         VARCHAR(100) NOT NULL,
    reason                  TEXT,
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
