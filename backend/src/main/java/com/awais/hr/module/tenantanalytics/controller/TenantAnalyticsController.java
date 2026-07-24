package com.awais.hr.module.tenantanalytics.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.tenantanalytics.service.TenantAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/tenant-analytics")
public class TenantAnalyticsController {

    private final TenantAnalyticsService tenantAnalyticsService;

    public TenantAnalyticsController(TenantAnalyticsService tenantAnalyticsService) {
        this.tenantAnalyticsService = tenantAnalyticsService;
    }

    @GetMapping("/overview")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getSaaSOverview() {
        return ResponseEntity.ok(tenantAnalyticsService.getSaaSOverview());
    }

    @GetMapping("/churn-risks")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getChurnRisks() {
        return ResponseEntity.ok(tenantAnalyticsService.getChurnRisks());
    }

    @PostMapping("/metrics")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> recordMetric(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(tenantAnalyticsService.recordMetric(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
