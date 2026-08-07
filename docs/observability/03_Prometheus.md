# 03 - Prometheus Metrics Collection

## Scrape Configuration
Prometheus scrapes targets every 15 seconds:
- `awais-hr-backend`: `http://backend:8080/api/v1/actuator/prometheus`
- `node-exporter`: `http://node-exporter:9100/metrics`
- `postgres-exporter`: `http://postgres-exporter:9187/metrics`
- `redis-exporter`: `http://redis-exporter:9121/metrics`
- `cadvisor`: `http://cadvisor:8080/metrics`
- `loki`: `http://loki:3100/metrics`
- `tempo`: `http://tempo:3200/metrics`
- `alertmanager`: `http://alertmanager:9093/metrics`

## Target Verification
Access Prometheus UI at `http://localhost:9090/targets` to verify all target scrape health status (`UP`).
