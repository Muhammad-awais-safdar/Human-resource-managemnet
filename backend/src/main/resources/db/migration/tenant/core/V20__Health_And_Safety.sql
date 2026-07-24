-- V20: Health & Safety

CREATE TABLE IF NOT EXISTS safety_incident (
    id                      VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title                   VARCHAR(255) NOT NULL,
    incident_date           TIMESTAMP NOT NULL DEFAULT NOW(),
    severity                VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    location                VARCHAR(255),
    description             TEXT,
    reporter_employee_id    VARCHAR(36) REFERENCES employee(id) ON DELETE SET NULL,
    status                  VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, UNDER_INVESTIGATION, RESOLVED, CLOSED
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ppe_assignment (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    item_name       VARCHAR(255) NOT NULL,
    employee_id     VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    assigned_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date     DATE,
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
