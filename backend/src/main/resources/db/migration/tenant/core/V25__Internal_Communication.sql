-- V25: Internal Communication

CREATE TABLE IF NOT EXISTS company_feed_post (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    author_id   VARCHAR(36),
    feed_type   VARCHAR(50) NOT NULL DEFAULT 'ANNOUNCEMENT', -- ANNOUNCEMENT, DEPARTMENT, EVENT
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_poll (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    question        VARCHAR(255) NOT NULL,
    options_json    TEXT NOT NULL, -- JSON array of options
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
