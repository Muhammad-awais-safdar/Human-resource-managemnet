-- V55: Centralized Enterprise Audit Logging Schema Enhancements

CREATE TABLE IF NOT EXISTS enterprise_audit_log (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(50),
    actor_email     VARCHAR(100) NOT NULL,
    action_type     VARCHAR(50) NOT NULL, -- LOGIN, FAILED_LOGIN, ROLE_ASSIGNMENT, SALARY_CHANGE, PAYROLL_RUN, LEAVE_APPROVAL, EXPORT
    entity_name     VARCHAR(100) NOT NULL,
    entity_id       VARCHAR(100) NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    details         TEXT,
    ip_address      VARCHAR(50),
    user_agent      VARCHAR(255),
    correlation_id  VARCHAR(100),
    performed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safely add non-destructive columns if enterprise_audit_log was created by V47
SET @exist1 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enterprise_audit_log' AND column_name = 'tenant_id');
SET @sqlstmt1 := IF(@exist1 = 0, 'ALTER TABLE enterprise_audit_log ADD COLUMN tenant_id VARCHAR(50)', 'SELECT 1');
PREPARE stmt1 FROM @sqlstmt1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @exist2 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enterprise_audit_log' AND column_name = 'old_value');
SET @sqlstmt2 := IF(@exist2 = 0, 'ALTER TABLE enterprise_audit_log ADD COLUMN old_value TEXT', 'SELECT 1');
PREPARE stmt2 FROM @sqlstmt2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SET @exist3 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enterprise_audit_log' AND column_name = 'new_value');
SET @sqlstmt3 := IF(@exist3 = 0, 'ALTER TABLE enterprise_audit_log ADD COLUMN new_value TEXT', 'SELECT 1');
PREPARE stmt3 FROM @sqlstmt3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

SET @exist4 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enterprise_audit_log' AND column_name = 'user_agent');
SET @sqlstmt4 := IF(@exist4 = 0, 'ALTER TABLE enterprise_audit_log ADD COLUMN user_agent VARCHAR(255)', 'SELECT 1');
PREPARE stmt4 FROM @sqlstmt4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

SET @exist5 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enterprise_audit_log' AND column_name = 'correlation_id');
SET @sqlstmt5 := IF(@exist5 = 0, 'ALTER TABLE enterprise_audit_log ADD COLUMN correlation_id VARCHAR(100)', 'SELECT 1');
PREPARE stmt5 FROM @sqlstmt5;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

-- Performance Indexes
CREATE INDEX idx_audit_log_actor ON enterprise_audit_log (actor_email, action_type);
CREATE INDEX idx_audit_log_entity ON enterprise_audit_log (entity_name, entity_id);
CREATE INDEX idx_audit_log_time ON enterprise_audit_log (performed_at);
