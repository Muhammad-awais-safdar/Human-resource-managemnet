# 14 - Multi-Tenant Monitoring Architecture

## Multi-Tenant Tagging Standards
Every metric and log entry generated in Awais HR SaaS is enriched with standardized tenant metadata tags:
- `tenantId`: Unique tenant identifier / subdomain
- `tenantName`: Friendly organization name
- `plan`: Tier (e.g. `enterprise`, `pro`, `starter`)
- `subscription`: Status (`active`, `past_due`)
- `environment`: Deployment stage (`production`)
- `region`: AWS/Cloud region (`us-east-1`)
- `service`: Microservice name (`hr-engine`)
- `instance`: Host/Pod identifier

## Grafana Tenant Filter
Dashboards contain template variable `$tenantId` allowing operators to isolate telemetry for any specific customer.
