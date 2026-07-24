-- V21: Employee Engagement

CREATE TABLE IF NOT EXISTS engagement_survey (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title       VARCHAR(255) NOT NULL,
    survey_type VARCHAR(50) NOT NULL DEFAULT 'PULSE', -- PULSE, ANNUAL, FEEDBACK
    status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date    DATE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_recognition (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id   VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    receiver_id VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    badge_name  VARCHAR(100) NOT NULL DEFAULT 'STAR_PERFORMER',
    message     TEXT,
    points      INT NOT NULL DEFAULT 50,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suggestion_box (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category        VARCHAR(100) NOT NULL DEFAULT 'WORKPLACE_CULTURE',
    suggestion_text TEXT NOT NULL,
    is_anonymous    BOOLEAN NOT NULL DEFAULT TRUE,
    submitter_id    VARCHAR(36),
    status          VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
