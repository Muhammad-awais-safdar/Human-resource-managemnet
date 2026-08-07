# 16 - Troubleshooting & Diagnostics

## Common Issues & Solutions

### 1. Prometheus Targets DOWN
- Check container status: `docker compose ps`
- Verify network connectivity: `docker compose exec prometheus wget -qO- http://backend:8080/api/v1/actuator/prometheus`

### 2. Traces Not Appearing in Tempo
- Confirm OTLP exporter endpoint setting in `application.properties`: `http://tempo:4318/v1/traces`
- Verify Tempo container status: `docker compose logs tempo`

### 3. Grafana Datasource Connection Errors
- Check container health: `http://localhost:3001/api/health`
- Re-trigger provisioning reload: `docker compose restart grafana`
