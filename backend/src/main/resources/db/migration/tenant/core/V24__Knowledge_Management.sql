-- V24: Knowledge Management

CREATE TABLE IF NOT EXISTS knowledge_article (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title       VARCHAR(255) NOT NULL,
    category    VARCHAR(100) NOT NULL DEFAULT 'GENERAL',
    content     TEXT NOT NULL,
    author_id   VARCHAR(36),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sop_document (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sop_title       VARCHAR(255) NOT NULL,
    department      VARCHAR(100) NOT NULL DEFAULT 'HR',
    version         VARCHAR(20) NOT NULL DEFAULT '1.0',
    file_url        VARCHAR(500),
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
