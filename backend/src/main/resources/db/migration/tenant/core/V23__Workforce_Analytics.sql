-- V23: Workforce Analytics

CREATE TABLE IF NOT EXISTS workforce_metric_snapshot (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    metric_key          VARCHAR(100) NOT NULL,
    metric_value        NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    category            VARCHAR(100) NOT NULL DEFAULT 'EXECUTIVE',
    snapshot_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attrition_trend (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    department_id       VARCHAR(36),
    period_year_month   VARCHAR(7) NOT NULL, -- E.g. '2026-07'
    total_headcount     INT NOT NULL DEFAULT 0,
    departed_count      INT NOT NULL DEFAULT 0,
    attrition_rate      NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
