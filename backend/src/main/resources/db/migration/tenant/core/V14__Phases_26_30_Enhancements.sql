-- =============================================
-- V14: Phases 26-30 Schema Enhancements
-- Phase 26: Workflow Engine
-- Phase 27: Communication & Notifications
-- Phase 28: Reports & Analytics
-- Phase 29: Integrations & Webhooks
-- Phase 30: Mobile Platform Sync
-- =============================================

-- =============================================
-- PHASE 26: WORKFLOW ENGINE
-- =============================================

CREATE TABLE IF NOT EXISTS workflow_definition (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    trigger_event   VARCHAR(100) NOT NULL,  -- e.g. 'ONBOARDING_COMPLETE', 'LEAVE_APPROVED'
    steps_json      TEXT         NOT NULL,  -- JSON array of step definitions
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS workflow_execution (
    id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
    workflow_id         VARCHAR(36)  NOT NULL REFERENCES workflow_definition(id) ON DELETE CASCADE,
    triggered_by        VARCHAR(36),  -- employee_id who triggered it
    current_step_index  INT          NOT NULL DEFAULT 0,
    status              VARCHAR(50)  NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ESCALATED, CANCELLED
    context_json        TEXT,         -- dynamic runtime context data
    assigned_to         VARCHAR(36),  -- employee_id currently responsible
    escalation_at       TIMESTAMP,    -- when escalation should fire
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted             BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_workflow_execution_status    ON workflow_execution(status);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_workflow  ON workflow_execution(workflow_id);

-- =============================================
-- PHASE 27: COMMUNICATION & NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS platform_announcement (
    id              VARCHAR(36)   NOT NULL PRIMARY KEY,
    title           VARCHAR(300)  NOT NULL,
    content         TEXT          NOT NULL,
    target_audience VARCHAR(50)   NOT NULL DEFAULT 'ALL', -- ALL, DEPARTMENT, ROLE
    target_filter   VARCHAR(200),  -- department_id or role_code if targeted
    is_pinned       BOOLEAN       NOT NULL DEFAULT FALSE,
    created_by      VARCHAR(36)   NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP,
    deleted         BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS notification_queue (
    id              VARCHAR(36)   NOT NULL PRIMARY KEY,
    employee_id     VARCHAR(36)   NOT NULL,
    title           VARCHAR(300)  NOT NULL,
    message         TEXT          NOT NULL,
    category        VARCHAR(100)  NOT NULL DEFAULT 'GENERAL', -- GENERAL, LEAVE, PAYROLL, WORKFLOW
    is_read         BOOLEAN       NOT NULL DEFAULT FALSE,
    email_sent      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_notification_employee ON notification_queue(employee_id);
CREATE INDEX IF NOT EXISTS idx_notification_read     ON notification_queue(is_read);

-- =============================================
-- PHASE 28: REPORTS & ANALYTICS
-- =============================================

CREATE TABLE IF NOT EXISTS report_definition (
    id              VARCHAR(36)   NOT NULL PRIMARY KEY,
    name            VARCHAR(200)  NOT NULL,
    description     TEXT,
    query_template  TEXT          NOT NULL, -- parameterised SQL template
    parameters_json TEXT,                  -- JSON schema for expected parameters
    format          VARCHAR(20)   NOT NULL DEFAULT 'CSV', -- CSV, PDF, JSON
    module          VARCHAR(100)  NOT NULL DEFAULT 'GENERAL',
    created_by      VARCHAR(36)   NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN       NOT NULL DEFAULT FALSE
);

-- =============================================
-- PHASE 29: INTEGRATIONS & WEBHOOKS
-- =============================================

CREATE TABLE IF NOT EXISTS integration_config (
    id              VARCHAR(36)   NOT NULL PRIMARY KEY,
    provider        VARCHAR(100)  NOT NULL, -- GOOGLE, MICROSOFT, SLACK, etc.
    client_id       VARCHAR(500),
    client_secret   VARCHAR(500),
    settings_json   TEXT,
    active          BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS webhook_endpoint (
    id              VARCHAR(36)   NOT NULL PRIMARY KEY,
    target_url      VARCHAR(1000) NOT NULL,
    description     VARCHAR(300),
    secret          VARCHAR(500),          -- HMAC signing secret
    events_json     TEXT          NOT NULL, -- JSON array of subscribed events
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    last_triggered  TIMESTAMP,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN       NOT NULL DEFAULT FALSE
);

-- =============================================
-- PHASE 30: MOBILE PLATFORM SYNC
-- =============================================

CREATE TABLE IF NOT EXISTS mobile_device_sync (
    id              VARCHAR(36)   NOT NULL PRIMARY KEY,
    employee_id     VARCHAR(36)   NOT NULL,
    device_token    VARCHAR(500)  NOT NULL UNIQUE,
    platform        VARCHAR(20)   NOT NULL DEFAULT 'ANDROID', -- ANDROID, IOS
    client_version  VARCHAR(50),
    last_sync_at    TIMESTAMP,
    sync_delta_json TEXT,          -- last delta payload for conflict resolution
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_mobile_sync_employee ON mobile_device_sync(employee_id);
