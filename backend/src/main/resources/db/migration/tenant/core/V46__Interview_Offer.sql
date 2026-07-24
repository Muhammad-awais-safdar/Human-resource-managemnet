-- V46: Interview Scheduling & Offer Management

CREATE TABLE IF NOT EXISTS interview_schedule (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    candidate_name      VARCHAR(100) NOT NULL,
    interviewer_email   VARCHAR(100) NOT NULL,
    interview_date      TIMESTAMP NOT NULL,
    round_name          VARCHAR(50) NOT NULL DEFAULT 'TECHNICAL_ROUND_1',
    meeting_link        VARCHAR(255),
    status              VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_offer_letter (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    candidate_email     VARCHAR(100) NOT NULL,
    job_title           VARCHAR(100) NOT NULL,
    offered_salary      NUMERIC(10,2) NOT NULL DEFAULT 95000.00,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL', -- DRAFT, PENDING_APPROVAL, SENT, SIGNED
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
