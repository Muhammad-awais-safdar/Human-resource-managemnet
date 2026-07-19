package com.awais.hr.module.ai.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.ai.service.AiAutomationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/suite/ai")
public class AiAutomationController {

    private final AiAutomationService aiAutomationService;

    public AiAutomationController(AiAutomationService aiAutomationService) {
        this.aiAutomationService = aiAutomationService;
    }

    @GetMapping("/anomalies")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getAnomalies() {
        return ResponseEntity.ok(aiAutomationService.getAnomalies());
    }

    @PostMapping("/anomalies/detect")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> detectAnomalies() {
        aiAutomationService.runAnomalyDetection();
        return ResponseEntity.ok(Map.of("success", true, "message", "Anomaly detection routine executed."));
    }

    @GetMapping("/candidates/{id}/fit")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getCandidateFit(@PathVariable String id) {
        try {
            Map<String, Object> result = aiAutomationService.evaluateCandidateFit(id);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/employees/{id}/attrition")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getAttritionRisk(@PathVariable String id) {
        try {
            Map<String, Object> result = aiAutomationService.predictAttritionRisk(id);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
