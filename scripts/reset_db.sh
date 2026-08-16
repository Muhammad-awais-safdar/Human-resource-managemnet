#!/bin/bash
set -e

# Configuration defaults (matching application.properties)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
export PGPASSWORD="${PGPASSWORD:-root}"

echo "========================================================================"
echo "💥 ENTERPRISE HR SAAS DATABASE WIPE & RESET TOOL"
echo "========================================================================"
echo "Target Host : ${DB_HOST}:${DB_PORT}"
echo "Target User : ${DB_USER}"
echo "========================================================================"

# Fetch all project-related databases matching pattern 'awais_hr_%' or 'awais_%'
DATABASES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -t -A -c \
  "SELECT datname FROM pg_database WHERE datname LIKE 'awais_hr_%' OR datname LIKE 'awais_%';")

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
  echo "🔥 Terminating connections and dropping database: $DB ..."
  
  # Terminate open connections to target database
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB' AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true

  # Drop the database
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "DROP DATABASE IF EXISTS \"$DB\";"
    
  echo "   ✅ Dropped database '$DB' successfully."
done

echo "========================================================================"
echo "🎉 ALL PROJECT DATABASES HAVE BEEN DELETED SUCCESSFULLY!"
echo "Next time you run the backend ('mvn spring-boot:run'), fresh clean databases"
echo "and seed data will be automatically provisioned."
echo "========================================================================"
