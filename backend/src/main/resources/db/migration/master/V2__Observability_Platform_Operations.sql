-- V2__Observability_Platform_Operations.sql
-- Observability & Platform Operations Tables in Master/Observability Database

CREATE TABLE IF NOT EXISTS platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    request_id VARCHAR(100),
    trace_id VARCHAR(100),
    correlation_id VARCHAR(100),
    module_code VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_security_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100),
    user_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'WARN',
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_uri TEXT,
    request_method VARCHAR(10),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_exception_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100),
    request_id VARCHAR(100),
    trace_id VARCHAR(100),
    exception_class VARCHAR(255) NOT NULL,
    message TEXT,
    stack_trace TEXT,
    service_name VARCHAR(100),
    controller_name VARCHAR(100),
    request_uri TEXT,
    http_method VARCHAR(10),
    user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_alert_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    metric_name VARCHAR(100) NOT NULL,
    threshold_value NUMERIC(12, 2) NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL,
    duration_seconds INT DEFAULT 300,
    notification_channel VARCHAR(50) NOT NULL,
    destination_target TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON platform_audit_log (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_event_type ON platform_security_event (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exception_trace ON platform_exception_log (trace_id);

-- Seed default production alert rules if not existing
INSERT INTO platform_alert_configuration (id, rule_name, metric_name, threshold_value, comparison_operator, notification_channel, destination_target)
VALUES 
    (gen_random_uuid(), 'High API P95 Latency Alert', 'http_server_requests_seconds_max', 500.0, '>', 'SLACK', 'https://hooks.slack.com/services/alert-hook'),
    (gen_random_uuid(), 'HikariCP DB Connection Pool Exhaustion', 'hikaricp_connections_pending', 10.0, '>', 'PAGERDUTY', 'https://events.pagerduty.com/v2/enqueue')
ON CONFLICT (rule_name) DO NOTHING;
