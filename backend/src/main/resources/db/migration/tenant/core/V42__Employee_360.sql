-- V42: Employee 360 Profile

CREATE TABLE IF NOT EXISTS employee_manager_note (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id     VARCHAR(36) NOT NULL,
    author_email    VARCHAR(100) NOT NULL,
    note_content    TEXT NOT NULL,
    is_private      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_skill_matrix (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id     VARCHAR(36) NOT NULL,
    skill_name      VARCHAR(100) NOT NULL,
    proficiency     VARCHAR(50) NOT NULL DEFAULT 'ADVANCED', -- BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
