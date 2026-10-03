-- V19: Compliance Management Expansion

CREATE TABLE IF NOT EXISTS compliance_checklist (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title               VARCHAR(255) NOT NULL,
    country_code        VARCHAR(10) NOT NULL DEFAULT 'GLOBAL',
    category            VARCHAR(100) NOT NULL DEFAULT 'LABOR_LAW',
    requirement_details TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'COMPLIANT',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_risk_assessment (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    topic               VARCHAR(255) NOT NULL,
    impact_level        VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    likelihood_level    VARCHAR(50) NOT NULL DEFAULT 'LOW',
    mitigation_plan     TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policy_acknowledgement (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    policy_name         VARCHAR(255) NOT NULL,
    employee_id         VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    policy_version      VARCHAR(20) NOT NULL DEFAULT '1.0',
    acknowledged_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(policy_name, employee_id, policy_version)
);
