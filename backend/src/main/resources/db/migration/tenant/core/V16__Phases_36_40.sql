-- V16: Phases 36-40 — Succession Planning, Compensation, Benefits, Workforce Scheduling, Contractor Management

-- ─────────────────────────────────────────────────────────
-- Phase 36: Succession Planning
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS succession_position (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title           VARCHAR(255) NOT NULL,
    department_id   VARCHAR(36),
    is_critical     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talent_pool (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS succession_plan (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    position_id         VARCHAR(36) NOT NULL REFERENCES succession_position(id) ON DELETE CASCADE,
    successor_id        VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    readiness_score     INT NOT NULL DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
    timeline_months     INT NOT NULL DEFAULT 12,
    notes               TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talent_pool_member (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pool_id         VARCHAR(36) NOT NULL REFERENCES talent_pool(id) ON DELETE CASCADE,
    employee_id     VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(pool_id, employee_id)
);

-- ─────────────────────────────────────────────────────────
-- Phase 37: Compensation Management
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compensation_band (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    grade       VARCHAR(50) NOT NULL UNIQUE,
    min_salary  NUMERIC(15,2) NOT NULL,
    max_salary  NUMERIC(15,2) NOT NULL,
    currency    VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_review (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id         VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    current_salary      NUMERIC(15,2) NOT NULL,
    proposed_salary     NUMERIC(15,2) NOT NULL,
    merit_percentage    NUMERIC(5,2),
    reason              TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by         VARCHAR(36),
    effective_date      DATE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- Phase 38: Benefits Administration
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS benefit_plan (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(100) NOT NULL, -- HEALTH, LIFE, RETIREMENT, ALLOWANCE
    description     TEXT,
    monthly_cost    NUMERIC(10,2) NOT NULL DEFAULT 0,
    employer_share  NUMERIC(5,2) NOT NULL DEFAULT 100,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS benefit_enrollment (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id     VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    plan_id         VARCHAR(36) NOT NULL REFERENCES benefit_plan(id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    enrolled_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMP,
    UNIQUE(employee_id, plan_id)
);

-- ─────────────────────────────────────────────────────────
-- Phase 39: Workforce Scheduling
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workforce_schedule (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id     VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    schedule_date   DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, schedule_date)
);

CREATE TABLE IF NOT EXISTS open_shift (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    department_id   VARCHAR(36),
    shift_date      DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    required_count  INT NOT NULL DEFAULT 1,
    status          VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shift_bid (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    open_shift_id   VARCHAR(36) NOT NULL REFERENCES open_shift(id) ON DELETE CASCADE,
    employee_id     VARCHAR(36) NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    bid_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(open_shift_id, employee_id)
);

-- ─────────────────────────────────────────────────────────
-- Phase 40: Contractor Management
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contractor (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    vendor_company  VARCHAR(255),
    hourly_rate     NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contractor_agreement (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contractor_id   VARCHAR(36) NOT NULL REFERENCES contractor(id) ON DELETE CASCADE,
    document_name   VARCHAR(255) NOT NULL,
    document_url    TEXT,
    start_date      DATE NOT NULL,
    end_date        DATE,
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contractor_timesheet (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contractor_id   VARCHAR(36) NOT NULL REFERENCES contractor(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    hours_logged    NUMERIC(5,2) NOT NULL DEFAULT 0,
    description     TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    submitted_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(contractor_id, week_start_date)
);
