-- V56: Leave Workflow Engine Integration & Balance Ledger Schema

-- 1. Employee Leave Balance Table
CREATE TABLE IF NOT EXISTS employee_leave_balance (
    id                VARCHAR(36) PRIMARY KEY,
    employee_id       VARCHAR(50) NOT NULL,
    leave_policy_id   VARCHAR(50) NOT NULL,
    year              INT NOT NULL,
    allocated_days    DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    used_days         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    pending_days      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    remaining_days    DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_emp_policy_year UNIQUE (employee_id, leave_policy_id, year)
);

-- 2. Leave Balance Ledger Audit Trail
CREATE TABLE IF NOT EXISTS leave_balance_ledger (
    id                VARCHAR(36) PRIMARY KEY,
    employee_id       VARCHAR(50) NOT NULL,
    leave_policy_id   VARCHAR(50) NOT NULL,
    transaction_type  VARCHAR(30) NOT NULL, -- ACCRUAL, DEDUCTION, ADJUSTMENT, CARRYOVER, REVERSAL
    days              DECIMAL(5,2) NOT NULL,
    reference_id      VARCHAR(50),
    reason            VARCHAR(255),
    performed_by      VARCHAR(100),
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-throughput queries
CREATE INDEX idx_leave_balance_emp ON employee_leave_balance (employee_id, year);
CREATE INDEX idx_leave_ledger_emp ON leave_balance_ledger (employee_id, leave_policy_id);
CREATE INDEX idx_leave_request_overlap ON leave_request (employee_id, start_date, end_date, status);
