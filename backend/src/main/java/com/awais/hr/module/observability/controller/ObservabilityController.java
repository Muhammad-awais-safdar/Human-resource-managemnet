package com.awais.hr.module.observability.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.observability.service.ObservabilityService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/observability")
public class ObservabilityController {

    private final ObservabilityService observabilityService;

    public ObservabilityController(ObservabilityService observabilityService) {
        this.observabilityService = observabilityService;
    }

    @GetMapping("/logs")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getLogs(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String logLevel,
            @RequestParam(required = false) String traceId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "50") int limit) {

        String tenant = tenantId != null ? tenantId : TenantContextHolder.getCurrentTenant();
        return ApiResponse.success(observabilityService.getLogs(tenant, logLevel, traceId, query, limit));
    }

    @GetMapping("/logs/tail")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getTailLogs(@RequestParam(defaultValue = "330") int lines) {
        return ApiResponse.success(observabilityService.getTailLogs(lines));
    }

    @GetMapping(value = "/logs/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @HasPermission("SUPER_ADMIN")
    public SseEmitter streamLiveLogs() {
        return observabilityService.streamLiveLogs();
    }

    @GetMapping("/audit-logs")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getAuditLogs(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String moduleCode,
            @RequestParam(required = false) String traceId,
            @RequestParam(defaultValue = "50") int limit) {

        String tenant = tenantId != null ? tenantId : TenantContextHolder.getCurrentTenant();
        return ApiResponse.success(observabilityService.getAuditLogs(tenant, moduleCode, traceId, limit));
    }

    @GetMapping("/security-events")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getSecurityEvents(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String eventType,
            @RequestParam(defaultValue = "50") int limit) {

        String tenant = tenantId != null ? tenantId : TenantContextHolder.getCurrentTenant();
        return ApiResponse.success(observabilityService.getSecurityEvents(tenant, eventType, limit));
    }

    @GetMapping("/exceptions")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getExceptions(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String exceptionClass,
            @RequestParam(defaultValue = "50") int limit) {

        String tenant = tenantId != null ? tenantId : TenantContextHolder.getCurrentTenant();
        return ApiResponse.success(observabilityService.getExceptionLogs(tenant, exceptionClass, limit));
    }

    @GetMapping("/alerts")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getAlertRules() {
        return ApiResponse.success(observabilityService.getAlertRules());
    }

    @PostMapping("/alerts")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> createAlertRule(@RequestBody Map<String, Object> body) {
        return ApiResponse.success(observabilityService.saveAlertRule(body));
    }
}
