# 01 - Platform Architecture & Design Patterns

## Overview
The Awais HR Enterprise Observability Platform implements the Three Pillars of Observability: **Metrics**, **Logs**, and **Traces**, augmented with Multi-Tenant contextual enrichment and Automated Alerting.

## Data Flow Architecture

```
[ Frontend (Next.js) ]
       │ (W3C Trace Headers: traceparent)
       ▼
[ Spring Boot 3.3 Backend ] ─── (Micrometer / OTel) ───► [ Tempo (Traces) :4318 ]
       │                                                         │
       ├──► (Logstash JSON + MDC) ───────────────────────────────┼──► [ Loki (Logs) :3100 ]
       │                                                         │          │
       └──► (Actuator / Prometheus Endpoint)                     │          │
                     ▲                                           │          │
                     │                                           ▼          ▼
             [ Prometheus ] ───► [ Alertmanager ] ────────► [ Grafana OSS :3001 ]
```

## Architectural Guarantees
1. **Zero Business Logic Coupling**: Observability instrumentation is isolated in Spring AOP, Actuator Filters, and Docker exporters.
2. **Tenant Context Isolation**: MDC and Meter Filters inject `tenantId` and `tenantName` into all log entries and metric samples automatically.
3. **High Availability & Low Overhead**: Sampling probability defaults to 1.0 in dev/test and can be tuned via `management.tracing.sampling.probability`.
