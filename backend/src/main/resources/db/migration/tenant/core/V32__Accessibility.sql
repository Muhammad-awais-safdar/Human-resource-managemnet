-- V32: Accessibility

CREATE TABLE IF NOT EXISTS accessibility_preference (
    id                      VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    high_contrast           BOOLEAN NOT NULL DEFAULT FALSE,
    screen_reader_optimized BOOLEAN NOT NULL DEFAULT TRUE,
    font_scale_percent      INT NOT NULL DEFAULT 100,
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
