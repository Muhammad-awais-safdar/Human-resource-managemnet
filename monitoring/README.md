# HRM Observability Platform

Production-grade monitoring for the Awais HR Enterprise SaaS platform.

---

## Architecture

```
Spring Boot Backend
    ├── /actuator/prometheus ──► Prometheus (metrics)
    ├── Logback JSON File     ──► Promtail ──► Loki (logs)
    └── OpenTelemetry OTLP    ──► Tempo (traces)
                                        │
                                   Grafana (visualization)
                                        │
                               Alertmanager (alerts)
```

---

## Access URLs

| Service       | URL                              | Credentials        |
|---|---|---|
| Grafana       | http://localhost:3001             | admin / admin      |
| Prometheus    | http://localhost:9090             | none               |
| Alertmanager  | http://localhost:9093             | none               |
| Loki          | http://localhost:3100             | none               |
| Tempo         | http://localhost:3200             | none               |
| cAdvisor      | http://localhost:8081             | none               |
| Node Exporter | http://localhost:9100/metrics     | none               |

> ⚠️ Change Grafana admin password before exposing to any network.

---

## Grafana Dashboards

All dashboards are provisioned automatically into the **HRM — Production** folder.

| Dashboard | UID | Purpose |
|---|---|---|
| HRM — Production Overview | `hrm-overview` | Single pane of glass — start here |
| HRM — Application | `hrm-application` | JVM, GC, HikariCP, HTTP |
| HRM — API Performance | `hrm-api` | Latency, throughput, top endpoints |
| HRM — Logs | `hrm-logs` | Loki log viewer with filters |
| HRM — Infrastructure | `hrm-infrastructure` | Host + container metrics |
| HRM — Database & Redis | `hrm-datastore` | PostgreSQL + Redis |
| HRM — Troubleshooting | `hrm-troubleshoot` | "Something is broken. Start here." |

---

## Log Architecture

### Console (Terminal)
Human-readable, for local development:
```
2026-08-18 22:51:23 INFO  [tenant:awais] c.a.hr.config.ApiLoggingFilter - GET /api/employees → 200
```

### JSON File → Loki (Structured)
Each log line written to `/tmp/app-logs/app.log` inside the backend container with fields:
```json
{
  "timestamp": "2026-08-18T22:51:23.123Z",
  "level": "INFO",
  "service": "hr-engine",
  "environment": "production",
  "logger": "c.a.hr.config.ApiLoggingFilter",
  "message": "GET /api/employees → 200",
  "tenantId": "awais",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7"
}
```

### Loki Labels (Low-Cardinality)
| Label | Values | Purpose |
|---|---|---|
| `container` | awais-hr-backend, awais-hr-db, ... | Container identity |
| `service` | backend, db, redis, ... | Logical service name |
| `environment` | production | Environment tag |
| `level` | ERROR, WARN, INFO | Log severity |

---

## Distributed Tracing

Traces are sent via OTLP HTTP to Tempo at 10% sampling rate (`TRACING_SAMPLING=0.1`).

To increase sampling for debugging:
```bash
TRACING_SAMPLING=1.0 docker compose up -d backend
```

To find a trace in Grafana:
1. Open **Explore** → select **Tempo** datasource
2. Search by Service Name: `hr-engine`
3. Or paste a `traceId` from a log entry

---

## Metrics Collected

### Application (Spring Boot Actuator + Micrometer)
- `http_server_requests_seconds_*` — API request rate, latency, status codes
- `jvm_memory_*` — Heap, Non-Heap, GC
- `jvm_threads_*` — Thread count
- `hikaricp_connections_*` — Database connection pool
- `process_uptime_seconds` — Backend uptime

### Infrastructure (Node Exporter)
- `node_cpu_seconds_total` — Host CPU
- `node_memory_*` — Host memory
- `node_filesystem_*` — Disk usage
- `node_network_*` — Network I/O

### Containers (cAdvisor)
- `container_cpu_usage_seconds_total` — Per-container CPU
- `container_memory_rss` — Per-container memory

### Database (postgres-exporter)
- `pg_up` — Availability
- `pg_stat_activity_count` — Connection count
- `pg_stat_database_*` — Transactions, cache hits

### Redis (redis-exporter)
- `redis_up` — Availability
- `redis_memory_*` — Memory usage
- `redis_keyspace_hits_total` / `redis_keyspace_misses_total` — Cache hit ratio
- `redis_connected_clients` — Client count

---

## Alerts

### Critical
| Alert | Trigger | Action |
|---|---|---|
| `BackendDown` | Backend unreachable > 1m | Check backend container logs |
| `PostgreSQLDown` | pg_up == 0 > 30s | Check db container, disk space |
| `RedisDown` | redis_up == 0 > 30s | Check redis container |
| `HighHTTP5xxErrorRate` | 5xx > 5% for 2m | Check Troubleshooting dashboard |
| `HighJVMHeapUsage` | Heap > 88% for 3m | Increase memory, check for leaks |
| `DiskSpaceCritical` | Disk > 93% | Free disk, prune Docker images |

### Warning
| Alert | Trigger | Action |
|---|---|---|
| `HighCPUUsage` | CPU > 85% for 5m | Check container CPU |
| `HighMemoryUsage` | Memory > 90% for 5m | Check memory consumers |
| `HighAPILatencyP95` | P95 > 2s for 5m | Check slow endpoints |
| `HighAuthentication401Rate` | > 10 req/s for 2m | Possible brute force |

---

## Operational Commands

### Start Everything
```bash
docker compose up -d
```

### Stop Everything
```bash
docker compose down
```

### Restart Monitoring Only (no data loss)
```bash
docker compose restart prometheus grafana loki tempo promtail alertmanager
```

### View Backend Logs
```bash
docker logs awais-hr-backend -f --tail 100
```

### View Grafana Logs
```bash
docker logs awais-hr-grafana -f
```

### View Loki Logs
```bash
docker logs awais-hr-loki -f
```

### Check All Container Health
```bash
docker compose ps
```

### Check Prometheus Targets
```bash
curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool | grep -E '"health"|"job"'
```

### Check Backend Metrics
```bash
curl -s http://localhost:8080/api/v1/actuator/prometheus | head -50
```

### Check Loki Readiness
```bash
curl http://localhost:3100/ready
```

### Check Tempo Readiness
```bash
curl http://localhost:3200/ready
```

---

## Retention

| Component | Retention | Storage |
|---|---|---|
| Loki logs | 30 days (720h) | `/tmp/loki` volume |
| Prometheus metrics | Default (15 days) | `prometheus_data` volume |
| Tempo traces | 48 hours | `/tmp/tempo` volume |
| App log files | 7 days (rolling) | `/tmp/app-logs` in container |

---

## Security Checklist

- [ ] Change Grafana admin password from default `admin`
- [ ] Do not expose Grafana port `3001` to the internet
- [ ] Do not expose Prometheus port `9090` to the internet
- [ ] Do not expose Loki port `3100` to the internet
- [ ] Actuator endpoints are accessible at `/api/v1/actuator/*` — protect behind auth if exposing
- [ ] Logs contain no passwords, tokens, or credentials (confirmed by log config)
- [ ] `alertmanager.yml` contains no hardcoded email/Slack credentials

---

## Troubleshooting Guide

### "No data" in Grafana panel
1. Check Prometheus targets: http://localhost:9090/targets
2. Verify backend is up: http://localhost:8080/api/v1/actuator/health
3. Reload dashboard time range — use "Last 15m"

### Logs not appearing in Grafana Explore
1. Check Promtail: `docker logs awais-hr-promtail -f`
2. Verify Loki is ready: `curl http://localhost:3100/ready`
3. Check that backend is actually logging (container has output)

### Traces not appearing in Tempo
1. Verify `TRACING_ENABLED=true` in docker-compose backend env
2. Check backend logs for `otel` or `trace` errors
3. Confirm Tempo is receiving: `docker logs awais-hr-tempo -f`

### Alert not firing when it should
1. Check Prometheus: http://localhost:9090/alerts
2. Check rule evaluation: http://localhost:9090/rules
3. Check Alertmanager: http://localhost:9093
