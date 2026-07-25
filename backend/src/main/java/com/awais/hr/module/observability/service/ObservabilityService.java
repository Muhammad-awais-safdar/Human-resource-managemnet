package com.awais.hr.module.observability.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;
import java.util.Map;

public interface ObservabilityService {

    List<Map<String, Object>> getLogs(String tenantId, String logLevel, String traceId, String searchKeyword, int limit);

    List<Map<String, Object>> getTailLogs(int lines);

    SseEmitter streamLiveLogs();

    List<Map<String, Object>> getAuditLogs(String tenantId, String moduleCode, String traceId, int limit);

    List<Map<String, Object>> getSecurityEvents(String tenantId, String eventType, int limit);

    List<Map<String, Object>> getExceptionLogs(String tenantId, String exceptionClass, int limit);

    List<Map<String, Object>> getAlertRules();

    Map<String, Object> saveAlertRule(Map<String, Object> ruleData);

    void recordAuditLog(String tenantId, String userId, String requestId, String traceId, String moduleCode, String actionType, String entityName, String entityId, String oldValue, String newValue, String ipAddress, String userAgent);

    void recordAuditLog(String tenantId, String userId, String requestId, String traceId, String moduleCode, String actionType, String entityName, String entityId, String oldValue, String newValue, String ipAddress, String userAgent, Integer statusCode, Long responseTimeMs);

    void recordSecurityEvent(String tenantId, String userId, String eventType, String severity, String ipAddress, String userAgent, String requestUri, String requestMethod, String detailsJson);

    void recordExceptionLog(String tenantId, String requestId, String traceId, String exceptionClass, String message, String stackTrace, String serviceName, String controllerName, String requestUri, String httpMethod, String userId);
}
