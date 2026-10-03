-- Migration V3: Add missing type column to tenant table if not existing
SET @dbname = DATABASE();
SET @tablename = 'tenant';
SET @columnname = 'type';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE tenant ADD COLUMN type VARCHAR(50) DEFAULT ''SHARED_SCHEMA'''
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
