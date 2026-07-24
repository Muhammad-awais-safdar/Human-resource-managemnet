package com.awais.hr.module.workforce.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.workforce.service.WorkforcePlanningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/workforce-planning")
public class WorkforcePlanningController {

    private final WorkforcePlanningService planningService;

    public WorkforcePlanningController(WorkforcePlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/plans")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getPlans() {
        return ResponseEntity.ok(planningService.getPlans());
    }

    @PostMapping("/plans")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createPlan(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(planningService.createPlan(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/plans/{planId}/budgets")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getPositionBudgets(@PathVariable String planId) {
        return ResponseEntity.ok(planningService.getPositionBudgets(planId));
    }

    @PostMapping("/plans/{planId}/budgets")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> addPositionBudget(@PathVariable String planId, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(planningService.addPositionBudget(planId, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/plans/{planId}/scenarios")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getForecastScenarios(@PathVariable String planId) {
        return ResponseEntity.ok(planningService.getForecastScenarios(planId));
    }

    @PostMapping("/plans/{planId}/scenarios")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createForecastScenario(@PathVariable String planId, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(planningService.createForecastScenario(planId, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/plans/{planId}/analytics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getPlanningAnalytics(@PathVariable String planId) {
        return ResponseEntity.ok(planningService.getPlanningAnalytics(planId));
    }
}
