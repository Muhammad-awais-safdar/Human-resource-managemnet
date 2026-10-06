-- V61: Task Management Workflow & Status History Schema

CREATE TABLE IF NOT EXISTS project_task (
    id                VARCHAR(36) PRIMARY KEY,
    project_id        VARCHAR(50),
    title             VARCHAR(150) NOT NULL,
    description       TEXT,
    assignee_id       VARCHAR(50) NOT NULL,
    creator_id        VARCHAR(50) NOT NULL,
    priority          VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status            VARCHAR(30) NOT NULL DEFAULT 'TODO',   -- BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, COMPLETED, CANCELLED
    due_date          DATE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_assignee FOREIGN KEY (assignee_id) REFERENCES employee(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_status_history (
    id                VARCHAR(36) PRIMARY KEY,
    task_id           VARCHAR(36) NOT NULL,
    previous_status   VARCHAR(30),
    new_status        VARCHAR(30) NOT NULL,
    actor_email       VARCHAR(100) NOT NULL,
    comment           VARCHAR(255),
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_hist_task FOREIGN KEY (task_id) REFERENCES project_task(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_assignee_status ON project_task (assignee_id, status);
CREATE INDEX idx_task_project ON project_task (project_id);
CREATE INDEX idx_task_hist_task ON task_status_history (task_id);
