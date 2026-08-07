# 17 - SRE Incident Response Runbook

## Incident Playbooks

### Playbook 1: High CPU / Memory Alert Triggered
1. Open Grafana Dashboard: `01 - Infrastructure & Docker Overview`.
2. Identify top CPU/Memory consuming container via cAdvisor panel.
3. If `awais-hr-backend` is responsible, check JVM Heap usage on `02 - JVM & Spring Boot Metrics`.
4. Generate heap dump if necessary: `curl -X POST http://localhost:8080/api/v1/actuator/heapdump`.

### Playbook 2: Database Connection Pool Exhaustion
1. Open Grafana Dashboard: `03 - PostgreSQL Database Overview`.
2. Inspect HikariCP active vs idle connections.
3. Check active Postgres queries in `pg_stat_activity`.
