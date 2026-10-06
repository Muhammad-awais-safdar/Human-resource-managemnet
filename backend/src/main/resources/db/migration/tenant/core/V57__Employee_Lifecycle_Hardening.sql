-- V57: Employee Lifecycle State Machine & Event Tracking Schema

CREATE TABLE IF NOT EXISTS employee_lifecycle_event (
    id                VARCHAR(36) PRIMARY KEY,
    employee_id       VARCHAR(50) NOT NULL,
    event_type        VARCHAR(50) NOT NULL, -- ONBOARDING, PROBATION_CONFIRMATION, PROMOTION, DEPARTMENT_TRANSFER, ROLE_CHANGE, SALARY_REVISION, SUSPENSION, EXIT_CLEARANCE_INITIATED, OFFBOARDING_COMPLETED
    previous_state    VARCHAR(50),
    new_state         VARCHAR(50) NOT NULL, -- PROBATION, ACTIVE, SUSPENDED, PROMOTED, TRANSFERRED, NOTICE_PERIOD, TERMINATED, RESIGNED, RETIRED
    effective_date    DATE NOT NULL,
    reason            VARCHAR(255),
    initiated_by      VARCHAR(100) NOT NULL,
    approved_by       VARCHAR(100),
    status            VARCHAR(30) NOT NULL DEFAULT 'COMPLETED', -- PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lifecycle_emp FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

CREATE INDEX idx_lifecycle_emp_date ON employee_lifecycle_event (employee_id, effective_date);
CREATE INDEX idx_lifecycle_event_type ON employee_lifecycle_event (event_type);
