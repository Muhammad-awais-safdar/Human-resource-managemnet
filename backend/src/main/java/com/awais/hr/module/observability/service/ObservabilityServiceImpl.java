package com.awais.hr.module.observability.service;

import com.awais.hr.context.TenantContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.sql.DataSource;
import java.util.*;

@Service
public class ObservabilityServiceImpl implements ObservabilityService {

    private static final Logger log = LoggerFactory.getLogger(ObservabilityServiceImpl.class);
    private final DataSource dataSource;
    private final LogStreamManager logStreamManager;

    public ObservabilityServiceImpl(DataSource dataSource, LogStreamManager logStreamManager) {
        this.dataSource = dataSource;
        this.logStreamManager = logStreamManager;
    }

    private void ensureTablesExist(JdbcTemplate jdbc) {
        try {
            jdbc.execute("CREATE TABLE IF NOT EXISTS platform_audit_log (" +
                    "id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id VARCHAR(100) NOT NULL, user_id VARCHAR(100), " +
                    "request_id VARCHAR(100), trace_id VARCHAR(100), correlation_id VARCHAR(100), module_code VARCHAR(50) NOT NULL, " +
                    "action_type VARCHAR(100) NOT NULL, entity_name VARCHAR(100), entity_id VARCHAR(100), old_value JSONB, " +
                    "new_value JSONB, ip_address VARCHAR(45), user_agent TEXT, status_code INT, response_time_ms BIGINT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL)");

            try {
                jdbc.execute("ALTER TABLE platform_audit_log ADD COLUMN IF NOT EXISTS status_code INT");
                jdbc.execute("ALTER TABLE platform_audit_log ADD COLUMN IF NOT EXISTS response_time_ms BIGINT");
            } catch (Exception ignored) {}

            jdbc.execute("CREATE TABLE IF NOT EXISTS platform_security_event (" +
                    "id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id VARCHAR(100), user_id VARCHAR(100), " +
                    "event_type VARCHAR(50) NOT NULL, severity VARCHAR(20) NOT NULL DEFAULT 'WARN', ip_address VARCHAR(45), " +
                    "user_agent TEXT, request_uri TEXT, request_method VARCHAR(10), details JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL)");

            jdbc.execute("CREATE TABLE IF NOT EXISTS platform_exception_log (" +
                    "id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id VARCHAR(100), request_id VARCHAR(100), " +
                    "trace_id VARCHAR(100), exception_class VARCHAR(255) NOT NULL, message TEXT, stack_trace TEXT, " +
                    "service_name VARCHAR(100), controller_name VARCHAR(100), request_uri TEXT, http_method VARCHAR(10), user_id VARCHAR(100), " +
                    "created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL)");

            jdbc.execute("CREATE TABLE IF NOT EXISTS platform_alert_configuration (" +
                    "id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rule_name VARCHAR(100) NOT NULL UNIQUE, metric_name VARCHAR(100) NOT NULL, " +
                    "threshold_value NUMERIC(12, 2) NOT NULL, comparison_operator VARCHAR(10) NOT NULL, duration_seconds INT DEFAULT 300, " +
                    "notification_channel VARCHAR(50) NOT NULL, destination_target TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE, " +
                    "created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL)");
        } catch (Exception e) {
            log.warn("Table verification check in Observability service: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTailLogs(int lines) {
        return logStreamManager.getTailLogs(lines);
    }

    @Override
    public SseEmitter streamLiveLogs() {
        return logStreamManager.createStreamEmitter();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogs(String tenantId, String logLevel, String traceId, String searchKeyword, int limit) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTablesExist(jdbc);

        String activeTenant = tenantId != null && !tenantId.isBlank() ? tenantId : Optional.ofNullable(TenantContextHolder.getCurrentTenant()).orElse("awais");
        int maxLimit = limit > 0 ? limit : 50;

        List<Map<String, Object>> results = new ArrayList<>(logStreamManager.getTailLogs(maxLimit));

        try {
            List<Map<String, Object>> secEvents = jdbc.queryForList(
                    "SELECT created_at AS timestamp, severity AS level, tenant_id AS tenantId, 'security' AS module, " +
                            "id::text AS traceId, ('Security Event: ' || event_type || ' at ' || COALESCE(request_uri, '')) AS message, " +
                            "COALESCE(ip_address, '127.0.0.1') AS ip FROM platform_security_event ORDER BY created_at DESC LIMIT ?",
                    maxLimit
            );
            results.addAll(secEvents);
        } catch (Exception ignored) {}

        try {
            List<Map<String, Object>> auditEvents = jdbc.queryForList(
                    "SELECT created_at AS timestamp, 'INFO' AS level, tenant_id AS tenantId, module_code AS module, " +
                            "COALESCE(trace_id, id::text) AS traceId, ('Audit Action: ' || action_type || ' on ' || COALESCE(entity_name, '')) AS message, " +
                            "COALESCE(ip_address, '127.0.0.1') AS ip FROM platform_audit_log ORDER BY created_at DESC LIMIT ?",
                    maxLimit
            );
            results.addAll(auditEvents);
        } catch (Exception ignored) {}

        if (logLevel != null && !logLevel.isBlank() && !"ALL".equalsIgnoreCase(logLevel)) {
            results.removeIf(m -> !logLevel.equalsIgnoreCase((String) m.get("level")));
        }

        return results.subList(0, Math.min(results.size(), maxLimit));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAuditLogs(String tenantId, String moduleCode, String traceId, int limit) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTablesExist(jdbc);
        try {
            return jdbc.queryForList(
                    "SELECT id::text AS id, tenant_id AS tenantId, user_id AS userId, request_id AS requestId, " +
                            "trace_id AS traceId, module_code AS moduleCode, action_type AS actionType, entity_name AS entityName, " +
                            "entity_id AS entityId, ip_address AS ipAddress, created_at AS createdAt FROM platform_audit_log ORDER BY created_at DESC LIMIT ?",
                    limit > 0 ? limit : 50
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSecurityEvents(String tenantId, String eventType, int limit) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTablesExist(jdbc);
        try {
            return jdbc.queryForList(
                    "SELECT id::text AS id, tenant_id AS tenantId, user_id AS userId, event_type AS eventType, " +
                            "severity, ip_address AS ipAddress, user_agent AS userAgent, request_uri AS requestUri, created_at AS createdAt FROM platform_security_event ORDER BY created_at DESC LIMIT ?",
                    limit > 0 ? limit : 50
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExceptionLogs(String tenantId, String exceptionClass, int limit) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTablesExist(jdbc);
        try {
            return jdbc.queryForList(
                    "SELECT id::text AS id, tenant_id AS tenantId, request_id AS requestId, trace_id AS traceId, " +
                            "exception_class AS exceptionClass, message, stack_trace AS stackTrace, service_name AS serviceName, controller_name AS controllerName, created_at AS createdAt FROM platform_exception_log ORDER BY created_at DESC LIMIT ?",
                    limit > 0 ? limit : 50
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAlertRules() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTablesExist(jdbc);
        try {
            return jdbc.queryForList(
                    "SELECT id::text AS id, rule_name AS ruleName, metric_name AS metricName, threshold_value AS thresholdValue, " +
                            "comparison_operator AS comparisonOperator, duration_seconds AS durationSeconds, notification_channel AS channel, destination_target AS destinationTarget, is_active AS isActive FROM platform_alert_configuration ORDER BY created_at DESC"
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveAlertRule(Map<String, Object> ruleData) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTablesExist(jdbc);

        String name = (String) ruleData.get("ruleName");
        String metric = (String) ruleData.getOrDefault("metricName", "http_server_requests_seconds");
        double threshold = ruleData.get("thresholdValue") != null ? ((Number) ruleData.get("thresholdValue")).doubleValue() : 500.0;
        String op = (String) ruleData.getOrDefault("comparisonOperator", ">");
        String channel = (String) ruleData.getOrDefault("notificationChannel", "SLACK");
        String target = (String) ruleData.getOrDefault("destinationTarget", "https://hooks.slack.com/services/alert-hook");

        String id = UUID.randomUUID().toString();
        try {
            jdbc.update("INSERT INTO platform_alert_configuration (id, rule_name, metric_name, threshold_value, comparison_operator, notification_channel, destination_target) VALUES (CAST(? AS UUID), ?, ?, ?, ?, ?, ?)",
                    id, name, metric, threshold, op, channel, target);
        } catch (Exception ignored) {}
        
        logStreamManager.addLog("INFO", "observability", "awais", "tr-alert", "Alert rule configured: " + name, "127.0.0.1");
        return Map.of("id", id, "ruleName", name, "metricName", metric, "thresholdValue", threshold, "channel", channel, "status", "ACTIVE");
    }

    @Override
    @Async
    public void recordAuditLog(String tenantId, String userId, String requestId, String traceId, String moduleCode, String actionType, String entityName, String entityId, String oldValue, String newValue, String ipAddress, String userAgent) {
        recordAuditLog(tenantId, userId, requestId, traceId, moduleCode, actionType, entityName, entityId, oldValue, newValue, ipAddress, userAgent, null, null);
    }

    @Override
    @Async
    public void recordAuditLog(String tenantId, String userId, String requestId, String traceId, String moduleCode, String actionType, String entityName, String entityId, String oldValue, String newValue, String ipAddress, String userAgent, Integer statusCode, Long responseTimeMs) {
        // Non-blocking asynchronous background execution (0ms latency for HTTP user thread)
        String level = (statusCode != null && statusCode >= 400) ? "WARN" : "INFO";
        String logMsg = String.format("API Request: %s %s -> HTTP %s (%s ms)", actionType, entityName != null ? entityName : "", statusCode != null ? statusCode : 200, responseTimeMs != null ? responseTimeMs : 0);
        logStreamManager.addLog(level, moduleCode, tenantId, traceId, logMsg, ipAddress);
        try {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            jdbc.update(
                    "INSERT INTO platform_audit_log (tenant_id, user_id, request_id, trace_id, module_code, action_type, entity_name, entity_id, ip_address, user_agent, status_code, response_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    tenantId != null ? tenantId : "awais", userId, requestId, traceId, moduleCode, actionType, entityName, entityId, ipAddress, userAgent, statusCode, responseTimeMs
            );
        } catch (Exception ignored) {}
    }

    @Override
    @Async
    public void recordSecurityEvent(String tenantId, String userId, String eventType, String severity, String ipAddress, String userAgent, String requestUri, String requestMethod, String detailsJson) {
        // Non-blocking asynchronous background execution
        logStreamManager.addLog(severity != null ? severity : "WARN", "security", tenantId, "sec-" + UUID.randomUUID().toString().substring(0, 6), "Security Event: " + eventType + " " + requestUri, ipAddress);
        try {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            jdbc.update(
                    "INSERT INTO platform_security_event (tenant_id, user_id, event_type, severity, ip_address, user_agent, request_uri, request_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    tenantId != null ? tenantId : "awais", userId, eventType, severity != null ? severity : "INFO", ipAddress, userAgent, requestUri, requestMethod
            );
        } catch (Exception ignored) {}
    }

    @Override
    @Async
    public void recordExceptionLog(String tenantId, String requestId, String traceId, String exceptionClass, String message, String stackTrace, String serviceName, String controllerName, String requestUri, String httpMethod, String userId) {
        // Non-blocking asynchronous background execution
        logStreamManager.addLog("ERROR", "system", tenantId, traceId, "Exception: " + exceptionClass + " - " + message, "127.0.0.1");
        try {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            jdbc.update(
                    "INSERT INTO platform_exception_log (tenant_id, request_id, trace_id, exception_class, message, stack_trace, service_name, controller_name, request_uri, http_method, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    tenantId != null ? tenantId : "awais", requestId, traceId, exceptionClass, message, stackTrace, serviceName, controllerName, requestUri, httpMethod, userId
            );
        } catch (Exception ignored) {}
    }
}
