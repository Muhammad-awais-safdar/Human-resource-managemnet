# 11 - Docker Compose Architecture

## Services Topology
All services share the bridge network `awais-hr-network`:
- `postgres`: Primary database
- `backend`: Spring Boot API Engine
- `redis`: In-memory cache
- `frontend`: Next.js Web App
- `prometheus`: Metric aggregation
- `grafana`: Dashboard portal
- `loki`: Log engine
- `tempo`: Trace storage
- `alertmanager`: Alert gateway
- `node-exporter`: Host metrics
- `postgres-exporter`: DB metrics
- `redis-exporter`: Cache metrics
- `cadvisor`: Docker container telemetry

## Volume Strategy
Named persistent volumes ensure data persistence across restart cycles:
- `postgres_data`, `prometheus_data`, `grafana_data`, `loki_data`, `tempo_data`, `alertmanager_data`.
