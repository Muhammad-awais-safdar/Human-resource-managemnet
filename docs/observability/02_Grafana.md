# 02 - Grafana Visualization Platform

## Configuration & Provisioning
Grafana is pre-configured via file-based provisioning in `monitoring/grafana/provisioning/`.
- Datasources (`Prometheus`, `Loki`, `Tempo`) are automatically mounted at container boot.
- Dashboards in `/var/lib/grafana/dashboards/` are registered automatically in the "Awais HR Observability" folder.

## Access Details
- **URL**: `http://localhost:3001`
- **Default Username**: `admin`
- **Default Password**: `admin`

## Provisioned Dashboards
1. `01 - Infrastructure & Docker Overview`
2. `02 - JVM & Spring Boot Metrics`
3. `03 - PostgreSQL Database Overview`
4. `04 - Redis Cache Performance`
5. `05 - API Requests, Latency & Error Rate`
6. `06 - Executive Business KPIs & Financial Metrics`
7. `07 - Multi-Tenant Operations & Resource Usage`
8. `08 - Developer Deep-Dive & Tracing Diagnostics`
