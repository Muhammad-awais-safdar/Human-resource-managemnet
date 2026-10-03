#!/bin/bash
set -e

# Configuration defaults (matching application.properties)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
MYSQL_PWD="${MYSQL_PWD:-root}"
export MYSQL_PWD

echo "========================================================================"
echo "💥 ENTERPRISE HR SAAS DATABASE WIPE & RESET TOOL (MYSQL)"
echo "========================================================================"
echo "Target Host : ${DB_HOST}:${DB_PORT}"
echo "Target User : ${DB_USER}"
echo "========================================================================"

# Fetch all project-related databases matching pattern 'awais_hr_%' or 'awais_%'
DATABASES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e \
  "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'awais_hr_%' OR schema_name LIKE 'awais_%';" -sN)

if [ -z "$DATABASES" ]; then
  echo "✨ No enterprise HR databases found matching pattern 'awais_hr_%' or 'awais_%'."
  echo "========================================================================"
  exit 0
fi

echo "The following databases will be PERMANENTLY DROPPED:"
for DB in $DATABASES; do
  echo "  - $DB"
done
echo "------------------------------------------------------------------------"

for DB in $DATABASES; do
  echo "🔥 Dropping database: $DB ..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "DROP DATABASE IF EXISTS \`$DB\`;"
  echo "   ✅ Dropped database '$DB' successfully."
done

echo "========================================================================"
echo "🎉 ALL PROJECT DATABASES HAVE BEEN DELETED SUCCESSFULLY!"
echo "Next time you run the backend ('mvn spring-boot:run'), fresh clean databases"
echo "and seed data will be automatically provisioned."
echo "========================================================================"
