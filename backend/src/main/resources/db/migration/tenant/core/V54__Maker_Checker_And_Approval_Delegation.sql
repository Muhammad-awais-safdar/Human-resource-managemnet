-- V54: Maker-Checker & Approval Delegation Enhancements

-- 1. Ensure maker_checker_request table exists with complete fields
CREATE TABLE IF NOT EXISTS maker_checker_request (
    id                  VARCHAR(50) PRIMARY KEY,
    request_type        VARCHAR(50) NOT NULL, -- SALARY_REVISION, BANK_DISBURSEMENT, ROLE_PROMOTION, SENSITIVE_SETTING
    maker_employee_id   VARCHAR(50) NOT NULL,
    checker_employee_id VARCHAR(50),
    entity_id           VARCHAR(50) NOT NULL,
    change_payload      TEXT NOT NULL,
    status              VARCHAR(30) DEFAULT 'PENDING_CHECKER_APPROVAL', -- PENDING_CHECKER_APPROVAL, APPROVED, REJECTED, CANCELLED
    rejection_reason    TEXT,
    requested_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actioned_at         TIMESTAMP
);

-- Safely ensure rejection_reason column exists
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'maker_checker_request' AND column_name = 'rejection_reason');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE maker_checker_request ADD COLUMN rejection_reason TEXT', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Extend approval_delegation table with time-bound & scope fields
CREATE TABLE IF NOT EXISTS approval_delegation (
    id                      VARCHAR(36) PRIMARY KEY,
    delegator_email         VARCHAR(100) NOT NULL,
    delegatee_email         VARCHAR(100) NOT NULL,
    scope                   VARCHAR(50) DEFAULT 'ALL', -- ALL, LEAVE, EXPENSE, PAYROLL, SALARY
    reason                  TEXT,
    effective_from          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_until         TIMESTAMP,
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, EXPIRED
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safely ensure time-bound columns exist on approval_delegation
SET @exist1 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'approval_delegation' AND column_name = 'effective_from');
SET @sqlstmt1 := IF(@exist1 = 0, 'ALTER TABLE approval_delegation ADD COLUMN effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt1 FROM @sqlstmt1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @exist2 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'approval_delegation' AND column_name = 'effective_until');
SET @sqlstmt2 := IF(@exist2 = 0, 'ALTER TABLE approval_delegation ADD COLUMN effective_until TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt2 FROM @sqlstmt2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SET @exist3 := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'approval_delegation' AND column_name = 'scope');
SET @sqlstmt3 := IF(@exist3 = 0, 'ALTER TABLE approval_delegation ADD COLUMN scope VARCHAR(50) DEFAULT ''ALL''', 'SELECT 1');
PREPARE stmt3 FROM @sqlstmt3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Performance Indexes
CREATE INDEX idx_maker_checker_status ON maker_checker_request (status, maker_employee_id);
CREATE INDEX idx_approval_delegation_active ON approval_delegation (delegator_email, delegatee_email, status);
