-- V1__Observability_Platform_Operations.sql
-- Dedicated Observability Database Schema Migration (awais_hr_observability)

CREATE TABLE IF NOT EXISTS platform_audit_log (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    request_id VARCHAR(100),
    trace_id VARCHAR(100),
    correlation_id VARCHAR(100),
    module_code VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_security_event (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(100),
    user_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'WARN',
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_uri TEXT,
    request_method VARCHAR(10),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_exception_log (
    id VARCHAR(50) PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_alert_configuration (
    id VARCHAR(50) PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    metric_name VARCHAR(100) NOT NULL,
    threshold_value NUMERIC(12, 2) NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL,
    duration_seconds INT DEFAULT 300,
    notification_channel VARCHAR(50) NOT NULL,
    destination_target TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed default production alert rules
INSERT INTO platform_alert_configuration (id, rule_name, metric_name, threshold_value, comparison_operator, notification_channel, destination_target)
VALUES 
    ('alert-rule-1', 'High API P95 Latency Alert', 'http_server_requests_seconds_max', 500.0, '>', 'SLACK', 'https://hooks.slack.com/services/alert-hook'),
    ('alert-rule-2', 'HikariCP DB Connection Pool Exhaustion', 'hikaricp_connections_pending', 10.0, '>', 'PAGERDUTY', 'https://events.pagerduty.com/v2/enqueue')
ON DUPLICATE KEY UPDATE rule_name = VALUES(rule_name);
