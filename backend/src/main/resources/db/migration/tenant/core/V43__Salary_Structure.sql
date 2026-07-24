-- V43: Salary Structure Builder

CREATE TABLE IF NOT EXISTS salary_component (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    component_name  VARCHAR(100) NOT NULL,
    component_type  VARCHAR(50) NOT NULL DEFAULT 'EARNING', -- EARNING, DEDUCTION
    calculation_type VARCHAR(50) NOT NULL DEFAULT 'FIXED', -- FIXED, PERCENTAGE
    default_amount  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_taxable      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_structure_template (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    template_name   VARCHAR(100) NOT NULL,
    pay_grade       VARCHAR(50) NOT NULL DEFAULT 'GRADE_A',
    base_salary     NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
