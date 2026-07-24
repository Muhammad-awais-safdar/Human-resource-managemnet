package com.awais.hr.module.analytics.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.analytics.service.WorkforceAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/analytics")
public class WorkforceAnalyticsController {

    private final WorkforceAnalyticsService analyticsService;

    public WorkforceAnalyticsController(WorkforceAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/metrics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getMetricSnapshots() {
        return ResponseEntity.ok(analyticsService.getMetricSnapshots());
    }

    @PostMapping("/metrics")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> recordMetricSnapshot(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(analyticsService.recordMetricSnapshot(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/attrition")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getAttritionTrends() {
        return ResponseEntity.ok(analyticsService.getAttritionTrends());
    }

    @PostMapping("/attrition")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> recordAttritionTrend(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(analyticsService.recordAttritionTrend(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
