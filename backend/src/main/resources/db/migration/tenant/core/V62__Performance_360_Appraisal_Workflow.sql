-- V62: Performance Management 360-Degree Appraisal Workflow Schema

CREATE TABLE IF NOT EXISTS performance_review_cycle (
    id                VARCHAR(36) PRIMARY KEY,
    title             VARCHAR(150) NOT NULL,
    review_period     VARCHAR(30) NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, IN_PROGRESS, CALIBRATION, COMPLETED, CANCELLED
    start_date        DATE NOT NULL,
    end_date          DATE NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_appraisal_360 (
    id                VARCHAR(36) PRIMARY KEY,
    cycle_id          VARCHAR(36) NOT NULL,
    employee_id       VARCHAR(50) NOT NULL,
    evaluator_id      VARCHAR(50) NOT NULL,
    self_rating       INT,
    self_summary      TEXT,
    manager_rating    INT,
    manager_summary   TEXT,
    calibrated_rating INT,
    status            VARCHAR(30) NOT NULL DEFAULT 'SELF_APPRAISAL', -- SELF_APPRAISAL, PEER_REVIEW, MANAGER_REVIEW, CALIBRATION, FINALIZED, ACKNOWLEDGED
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appraisal_cycle FOREIGN KEY (cycle_id) REFERENCES performance_review_cycle(id) ON DELETE CASCADE,
    CONSTRAINT fk_appraisal_emp FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT uk_emp_cycle UNIQUE (employee_id, cycle_id)
);

CREATE TABLE IF NOT EXISTS appraisal_cycle_log (
    id                VARCHAR(36) PRIMARY KEY,
    appraisal_id      VARCHAR(36) NOT NULL,
    previous_status   VARCHAR(30),
    new_status        VARCHAR(30) NOT NULL,
    actor_email       VARCHAR(100) NOT NULL,
    comment           VARCHAR(255),
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appraisal_log FOREIGN KEY (appraisal_id) REFERENCES employee_appraisal_360(id) ON DELETE CASCADE
);

CREATE INDEX idx_appraisal_emp ON employee_appraisal_360 (employee_id, status);
CREATE INDEX idx_appraisal_cycle ON employee_appraisal_360 (cycle_id);
