-- V26: Enterprise Search

CREATE TABLE IF NOT EXISTS search_index_entry (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    entity_type VARCHAR(100) NOT NULL, -- EMPLOYEE, DOCUMENT, POLICY, KNOWLEDGE_ARTICLE
    entity_id   VARCHAR(36) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
