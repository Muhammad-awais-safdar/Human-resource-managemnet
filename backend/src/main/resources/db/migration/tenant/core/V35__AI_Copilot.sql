-- V35: AI Copilot

CREATE TABLE IF NOT EXISTS ai_copilot_session (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    prompt          TEXT NOT NULL,
    response        TEXT NOT NULL,
    category        VARCHAR(50) NOT NULL DEFAULT 'HR_ASSISTANT', -- HR_ASSISTANT, POLICY_QA, WORKFLOW_BUILDER
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
