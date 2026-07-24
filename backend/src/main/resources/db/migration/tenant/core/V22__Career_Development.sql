-- V22: Career Development

CREATE TABLE IF NOT EXISTS career_path (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title           VARCHAR(255) NOT NULL,
    department_id   VARCHAR(36),
    level_step      INT NOT NULL DEFAULT 1,
    required_skills TEXT,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentorship_pair (
    id               VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    mentor_id        VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    mentee_id        VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    goal_description TEXT,
    start_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    status           VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS development_plan (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id     VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    target_role     VARCHAR(255) NOT NULL,
    skill_gaps      TEXT,
    action_plan     TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
