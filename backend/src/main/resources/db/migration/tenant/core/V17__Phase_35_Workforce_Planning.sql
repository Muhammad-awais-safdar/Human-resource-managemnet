-- V17: Phase 35 — Workforce Planning

CREATE TABLE IF NOT EXISTS workforce_plan (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title           VARCHAR(255) NOT NULL,
    planning_year   INT NOT NULL,
    department_id   VARCHAR(36),
    target_headcount INT NOT NULL DEFAULT 0,
    allocated_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
    status          VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS position_budget (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id         VARCHAR(36) NOT NULL REFERENCES workforce_plan(id) ON DELETE CASCADE,
    job_title       VARCHAR(255) NOT NULL,
    department_id   VARCHAR(36),
    required_count  INT NOT NULL DEFAULT 1,
    budgeted_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
    hiring_quarter  VARCHAR(10) NOT NULL DEFAULT 'Q1',
    status          VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workforce_forecast_scenario (
    id                      VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id                 VARCHAR(36) NOT NULL REFERENCES workforce_plan(id) ON DELETE CASCADE,
    scenario_name           VARCHAR(255) NOT NULL,
    growth_rate_pct         NUMERIC(5,2) NOT NULL DEFAULT 0,
    projected_turnover_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
    projected_headcount     INT NOT NULL DEFAULT 0,
    projected_cost          NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
