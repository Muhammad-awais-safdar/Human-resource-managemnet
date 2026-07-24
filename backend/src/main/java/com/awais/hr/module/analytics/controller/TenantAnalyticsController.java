package com.awais.hr.module.analytics.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.analytics.service.TenantAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/tenant-analytics")
public class TenantAnalyticsController {

    private final TenantAnalyticsService analyticsService;

    public TenantAnalyticsController(TenantAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getSaaSOverview() {
        return ResponseEntity.ok(analyticsService.getSaaSOverview());
    }

    @GetMapping("/tenant-metrics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getTenantMetrics() {
        return ResponseEntity.ok(analyticsService.getTenantMetrics());
    }

    @PostMapping("/metrics")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> recordMetric(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(analyticsService.recordMetric(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
