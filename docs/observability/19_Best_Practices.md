# 19 - Observability Engineering Best Practices

## Core Standards
1. **Use Standardized Labels**: Always include `tenantId`, `service`, `environment`, and `region`.
2. **Control Metric Cardinality**: Avoid dynamic values (user IDs, emails, raw UUIDs) as metric tag values. Use low-cardinality tags.
3. **Trace Everything**: Ensure context headers (`traceparent`) are propagated across internal service boundaries.
4. **Actionable Alerts**: Every alert must point directly to an SRE runbook item with actionable remediation steps.
