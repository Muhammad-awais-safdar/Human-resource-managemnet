# 09 - Alertmanager & Alert Rules

## Notification Channels
Alertmanager (`monitoring/alertmanager/alertmanager.yml`) routes alerts to:
- **Slack**: `#ops-critical-alerts` and `#ops-warnings`
- **Email**: `sre-oncall@awais-hr.com`
- **Webhook**: `http://backend:8080/api/v1/observability/alerts/webhook`
- **Microsoft Teams & Telegram**: Webhook bridge integrations

## Configured Alert Rules (`alerts.yml`)
- Infrastructure: `ApplicationDown`, `HighCPUUsage`, `HighMemoryUsage`, `DiskFullWarning`, `DiskFullCritical`
- Services: `PostgresDown`, `RedisDown`, `PrometheusDown`, `GrafanaDown`, `LokiDown`, `TempoDown`
- Performance: `HighHttpErrorRate`, `SlowApiResponses`, `HighJvmHeapUsage`, `DatabaseConnectionPoolExhaustion`, `LongGarbageCollectionPause`
- Business: `PayrollProcessingFailure`, `AttendanceProcessingFailure`, `SubscriptionFailure`, `TenantDatabaseOffline`, `BackupFailureAlert`
