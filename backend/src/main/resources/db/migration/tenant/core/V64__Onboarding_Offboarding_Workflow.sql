-- V64: Onboarding & Offboarding Cross-Department Workflow Schema

CREATE TABLE IF NOT EXISTS employee_onboarding (
    id            VARCHAR(36) PRIMARY KEY,
    employee_id   VARCHAR(50) NOT NULL,
    status        VARCHAR(30) NOT NULL DEFAULT 'INITIATED', -- INITIATED, DOCUMENTATION_PENDING, IT_PROVISIONING, HR_ORIENTATED, COMPLETED, CANCELLED
    start_date    DATE NOT NULL,
    completed_at  TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_onboard_emp FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_offboarding (
    id               VARCHAR(36) PRIMARY KEY,
    employee_id      VARCHAR(50) NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'INITIATED', -- INITIATED, CLEARANCE_PENDING, ASSET_RETURNED, IT_DEPROVISIONED, EXIT_INTERVIEW_COMPLETED, FINAL_SETTLEMENT_COMPLETED, COMPLETED, CANCELLED
    resignation_date DATE NOT NULL,
    last_working_day DATE NOT NULL,
    reason           VARCHAR(255),
    completed_at     TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_offboard_emp FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cross_dept_clearance_task (
    id            VARCHAR(36) PRIMARY KEY,
    workflow_type VARCHAR(20) NOT NULL, -- ONBOARDING or OFFBOARDING
    reference_id  VARCHAR(36) NOT NULL,
    department    VARCHAR(30) NOT NULL, -- IT, HR, FINANCE, FACILITIES
    task_name     VARCHAR(150) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, WAIVED
    completed_by  VARCHAR(100),
    completed_at  TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clearance_ref ON cross_dept_clearance_task (reference_id, department, status);
CREATE INDEX idx_onboard_emp ON employee_onboarding (employee_id, status);
CREATE INDEX idx_offboard_emp ON employee_offboarding (employee_id, status);
