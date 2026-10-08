-- V63: Recruitment & ATS Pipeline Workflow Schema

ALTER TABLE job_requisition ADD COLUMN created_by VARCHAR(100);
ALTER TABLE job_requisition ADD COLUMN approved_by VARCHAR(100);

CREATE TABLE IF NOT EXISTS candidate_stage_log (
    id                VARCHAR(36) PRIMARY KEY,
    candidate_id      VARCHAR(50) NOT NULL,
    previous_stage    VARCHAR(30),
    new_stage         VARCHAR(30) NOT NULL,
    actor_email       VARCHAR(100) NOT NULL,
    comment           VARCHAR(255),
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_stage_cand FOREIGN KEY (candidate_id) REFERENCES candidate_application(id) ON DELETE CASCADE
);

CREATE INDEX idx_cand_stage_cand ON candidate_stage_log (candidate_id);
CREATE INDEX idx_job_req_status ON job_requisition (status);
