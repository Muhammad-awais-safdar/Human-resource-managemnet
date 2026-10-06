-- V59: Payroll Workflow Engine & Locking Schema

CREATE TABLE IF NOT EXISTS payroll_run (
    id                VARCHAR(36) PRIMARY KEY,
    pay_period        VARCHAR(20) NOT NULL, -- e.g. 2026-10
    status            VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, CALCULATED, UNDER_REVIEW, APPROVED, LOCKED, DISBURSED, CANCELLED
    total_employees   INT NOT NULL DEFAULT 0,
    total_gross       DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total_tax         DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total_deductions  DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total_net         DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    initiated_by      VARCHAR(100) NOT NULL,
    approved_by       VARCHAR(100),
    locked_at         TIMESTAMP,
    disbursed_at      TIMESTAMP,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_payroll_period UNIQUE (pay_period)
);

CREATE TABLE IF NOT EXISTS payslip_ledger (
    id                VARCHAR(36) PRIMARY KEY,
    payroll_run_id    VARCHAR(36) NOT NULL,
    employee_id       VARCHAR(50) NOT NULL,
    pay_period        VARCHAR(20) NOT NULL,
    basic_salary      DECIMAL(12,2) NOT NULL,
    allowance         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    gross_salary      DECIMAL(12,2) NOT NULL,
    tax_amount        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    deductions        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    net_salary        DECIMAL(12,2) NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'PAID',
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payslip_run FOREIGN KEY (payroll_run_id) REFERENCES payroll_run(id) ON DELETE CASCADE
);

CREATE INDEX idx_payslip_ledger_period ON payslip_ledger (pay_period);
CREATE INDEX idx_payslip_ledger_emp ON payslip_ledger (employee_id, pay_period);
