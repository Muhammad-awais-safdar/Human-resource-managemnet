-- V45: Payroll & Bank Integration

CREATE TABLE IF NOT EXISTS employee_bank_detail (
    id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id     VARCHAR(36) NOT NULL,
    bank_name       VARCHAR(100) NOT NULL,
    account_number  VARCHAR(50) NOT NULL,
    routing_code    VARCHAR(50) NOT NULL,
    format_type     VARCHAR(20) NOT NULL DEFAULT 'NACHA', -- NACHA, BACS, SIF
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_payroll_batch (
    id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    batch_name      VARCHAR(100) NOT NULL,
    period_month    VARCHAR(20) NOT NULL,
    total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status          VARCHAR(30) NOT NULL DEFAULT 'LOCKED',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
