# Awais HR Enterprise SaaS - Observability Platform

Welcome to the production-grade Observability Platform documentation for **Awais HR Enterprise SaaS**.

## Platform Components

| Service | Technology | Port | Description |
| :--- | :--- | :--- | :--- |
| **Metrics Collector** | Prometheus | `9090` | Scrapes JVM, Spring Actuator, exporters, and host metrics |
| **Visualization** | Grafana OSS | `3001` | Provisioned dashboards for Infra, JVM, DB, API, Business KPIs, Tenants |
| **Centralized Logging** | Loki | `3100` | Log aggregation with structured JSON and MDC tenant context |
| **Distributed Tracing** | Tempo | `3200` / `4318` | W3C trace context, end-to-end HTTP/DB/Redis tracing |
| **Alerting** | Alertmanager | `9093` | Alert routing for Slack, Teams, Email, Webhooks, Telegram |
| **Host Exporter** | Node Exporter | `9100` | System-level CPU, Memory, Disk, Network metrics |
| **Database Exporter**| Postgres Exporter| `9187` | PostgreSQL query latency, connections, transaction rate |
| **Cache Exporter** | Redis Exporter | `9121` | Redis memory usage, hit rate, processed commands |
| **Container Metrics**| cAdvisor | `8081` | Docker container CPU, Memory, I/O metrics |

## Quick Start Command

Start the entire application and observability stack with a single command:
```bash
docker compose up -d
```

Access Grafana at: `http://localhost:3001` (Credentials: `admin` / `admin`).
