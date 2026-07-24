-- V18: Visitor Management

CREATE TABLE IF NOT EXISTS visitor_log (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    visitor_name        VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(50),
    company             VARCHAR(255),
    host_employee_id    VARCHAR(36) REFERENCES employee(id) ON DELETE SET NULL,
    purpose             TEXT,
    qr_pass_code        VARCHAR(100) UNIQUE,
    check_in_time       TIMESTAMP,
    check_out_time      TIMESTAMP,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, CHECKED_IN, CHECKED_OUT, REJECTED
    security_clearance VARCHAR(50) NOT NULL DEFAULT 'PASSED',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
