-- V47: Audit Center & Activity Log

CREATE TABLE IF NOT EXISTS enterprise_audit_log (
    id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    actor_email     VARCHAR(100) NOT NULL,
    action_type     VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, EXPORT
    entity_name     VARCHAR(100) NOT NULL,
    entity_id       VARCHAR(36) NOT NULL,
    details         TEXT,
    ip_address      VARCHAR(50),
    performed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
