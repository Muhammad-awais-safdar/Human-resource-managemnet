# 04 - Loki Centralized Logging

## Overview
Loki aggregates structured JSON logs output by the Spring Boot backend via `net.logstash.logback.encoder.LogstashEncoder`.

## MDC Key Indexing
Logs emitted by the backend automatically include the following indexed metadata fields:
- `tenantId` (e.g. `awais`, `tenant-uuid`)
- `traceId` (W3C / OTel trace identifier)
- `spanId` (OTel span identifier)
- `correlationId`
- `clientIp`
- `requestUri`
- `method`

## Common LogQL Queries
- Filter logs for specific tenant: `{service="awais-hr-backend"} | json | tenantId = "awais"`
- Filter logs for specific trace ID: `{service="awais-hr-backend"} | json | traceId = "tr-12345678"`
- Filter ERROR logs: `{service="awais-hr-backend"} | json | level = "ERROR"`
