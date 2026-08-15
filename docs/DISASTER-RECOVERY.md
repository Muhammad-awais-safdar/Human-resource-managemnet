# Enterprise SaaS Platform Disaster Recovery & Backup Plan

## Overview
This document outlines the backup, restore, and disaster recovery procedures for the Awais HR Enterprise SaaS Platform.

---

## 1. Database Backup Strategy

### Automated PostgreSQL Backup (`pg_dump`)
Daily logical backups of master database (`awais_hr_master`) and individual tenant databases are generated using PostgreSQL `pg_dump`:

```bash
# Automated Master Database Backup Command
pg_dump -h ${DB_HOST} -U ${DB_USER} -d awais_hr_master -F c -b -v -f /backups/master_$(date +%Y%m%d_%H%M%S).dump

# Tenant Database Backup Command (per tenant)
pg_dump -h ${DB_HOST} -U ${DB_USER} -d tenant_${TENANT_ID} -F c -b -v -f /backups/tenant_${TENANT_ID}_$(date +%Y%m%d_%H%M%S).dump
```

---

## 2. Restoration & Data Integrity Verification

### Point-in-Time Restore Procedure
1. Create target restoration database:
   ```bash
   createdb -h ${DB_HOST} -U ${DB_USER} awais_hr_master_restore
   ```
2. Restore database dump:
   ```bash
   pg_restore -h ${DB_HOST} -U ${DB_USER} -d awais_hr_master_restore -v /backups/master_latest.dump
   ```
3. Run Flyway migration validation check:
   ```bash
   mvn flyway:validate -Dflyway.url=jdbc:postgresql://${DB_HOST}:5432/awais_hr_master_restore
   ```
4. Verify tenant data isolation post-restore (ensure zero cross-tenant record leakage).

---

## 3. Recovery Objectives
- **RPO (Recovery Point Objective)**: < 1 hour (via WAL archiving + daily backups).
- **RTO (Recovery Time Objective)**: < 30 minutes for single-tenant restore, < 2 hours for full platform disaster recovery.
