# 05 - Tempo Distributed Tracing

## Receiver Protocols
Tempo is configured in `monitoring/tempo/tempo-config.yml` with:
- **OTLP gRPC**: `0.0.0.0:4317`
- **OTLP HTTP**: `0.0.0.0:4318`
- **HTTP Gateway**: `0.0.0.0:3200`

## Trace-to-Log Integration
Grafana links Tempo traces directly to Loki log streams by passing `traceId` as a derived field label. In Grafana Tempo view, clicking "Logs for this span" queries Loki filtered by exact span start/end times and `traceId`.
