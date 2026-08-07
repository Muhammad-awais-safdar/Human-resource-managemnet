-- Migration V3: Add missing type column to tenant table if not existing
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'SHARED_SCHEMA';
