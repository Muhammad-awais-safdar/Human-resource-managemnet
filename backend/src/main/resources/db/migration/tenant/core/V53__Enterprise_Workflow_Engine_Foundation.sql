-- V53: Enterprise Workflow Engine Foundation
-- Idempotent, additive schema for enterprise multi-step workflow engine

-- 1. Extend workflow_definition if table exists or create
CREATE TABLE IF NOT EXISTS workflow_definition (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    code            VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    module          VARCHAR(50)  NOT NULL DEFAULT 'GENERAL',
    resource_type   VARCHAR(100) NOT NULL DEFAULT 'GENERIC_RESOURCE',
    trigger_event   VARCHAR(100) NOT NULL DEFAULT 'MANUAL_SUBMIT',
    steps_json      TEXT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INT          NOT NULL DEFAULT 1,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Safely ensure code column exists if table was created by V14
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workflow_definition' AND column_name = 'code');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE workflow_definition ADD COLUMN code VARCHAR(100) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Workflow Versioning Table
CREATE TABLE IF NOT EXISTS workflow_version (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    workflow_definition_id  VARCHAR(36)  NOT NULL,
    version_number          INT          NOT NULL,
    steps_json              TEXT         NOT NULL,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_wf_version UNIQUE (workflow_definition_id, version_number)
);

-- 3. Workflow Step Configuration Table
CREATE TABLE IF NOT EXISTS workflow_step (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    workflow_version_id     VARCHAR(36)  NOT NULL,
    step_order              INT          NOT NULL,
    step_name               VARCHAR(100) NOT NULL,
    approver_type           VARCHAR(50)  NOT NULL, -- USER, ROLE, MANAGER, DEPARTMENT_HEAD, HR, FINANCE, CFO, RESOURCE_OWNER, DYNAMIC
    target_approver_id      VARCHAR(50),           -- Specific userId or roleCode if applicable
    required_permission     VARCHAR(100),
    access_scope            VARCHAR(30)  DEFAULT 'COMPANY',
    auto_approve_condition  VARCHAR(200),
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Workflow Instance Execution Table
CREATE TABLE IF NOT EXISTS workflow_instance (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    workflow_definition_id  VARCHAR(36)  NOT NULL,
    workflow_version_id     VARCHAR(36)  NOT NULL,
    resource_type           VARCHAR(100) NOT NULL,
    resource_id             VARCHAR(50)  NOT NULL,
    current_step_order      INT          NOT NULL DEFAULT 1,
    status                  VARCHAR(30)  NOT NULL DEFAULT 'IN_PROGRESS', -- DRAFT, IN_PROGRESS, APPROVED, REJECTED, RETURNED, CANCELLED, COMPLETED
    initiated_by            VARCHAR(36)  NOT NULL,
    started_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at            TIMESTAMP,
    updated_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_instance_resource UNIQUE (resource_type, resource_id)
);

-- 5. Workflow Actionable Task Table
CREATE TABLE IF NOT EXISTS workflow_task (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    workflow_instance_id    VARCHAR(36)  NOT NULL,
    step_id                 VARCHAR(36)  NOT NULL,
    step_order              INT          NOT NULL,
    assigned_employee_id    VARCHAR(36),
    assigned_role           VARCHAR(50),
    status                  VARCHAR(30)  NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, RETURNED, DELEGATED, EXPIRED
    due_date                TIMESTAMP,
    actioned_by             VARCHAR(36),
    actioned_at             TIMESTAMP,
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Workflow Action Audit History Table
CREATE TABLE IF NOT EXISTS workflow_action_history (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    workflow_instance_id    VARCHAR(36)  NOT NULL,
    task_id                 VARCHAR(36),
    actor_employee_id       VARCHAR(36)  NOT NULL,
    action                  VARCHAR(50)  NOT NULL, -- SUBMIT, APPROVE, REJECT, RETURN, CANCEL, DELEGATE, REASSIGN
    previous_state          VARCHAR(30)  NOT NULL,
    new_state               VARCHAR(30)  NOT NULL,
    comment                 TEXT,
    actioned_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_wf_instance_resource ON workflow_instance (resource_type, resource_id);
CREATE INDEX idx_wf_instance_status ON workflow_instance (status);
CREATE INDEX idx_wf_task_assigned ON workflow_task (assigned_employee_id, status);
CREATE INDEX idx_wf_history_instance ON workflow_action_history (workflow_instance_id);
