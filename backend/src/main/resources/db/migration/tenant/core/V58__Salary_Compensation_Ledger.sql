-- V58: Salary & Compensation History Ledger Schema

CREATE TABLE IF NOT EXISTS employee_salary_history (
    id                VARCHAR(36) PRIMARY KEY,
    employee_id       VARCHAR(50) NOT NULL,
    basic_salary      DECIMAL(12,2) NOT NULL,
    allowance         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    deductions        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    net_salary        DECIMAL(12,2) NOT NULL,
    currency          VARCHAR(10) NOT NULL DEFAULT 'USD',
    effective_date    DATE NOT NULL,
    revision_reason   VARCHAR(255),
    proposed_by       VARCHAR(100) NOT NULL,
    approved_by       VARCHAR(100) NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_hist_emp FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

CREATE INDEX idx_salary_hist_emp ON employee_salary_history (employee_id, effective_date);
