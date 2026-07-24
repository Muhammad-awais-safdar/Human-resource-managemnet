package com.awais.hr.module.healthsafety.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.healthsafety.service.HealthSafetyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/health-safety")
public class HealthSafetyController {

    private final HealthSafetyService healthSafetyService;

    public HealthSafetyController(HealthSafetyService healthSafetyService) {
        this.healthSafetyService = healthSafetyService;
    }

    @GetMapping("/incidents")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getIncidents() {
        return ResponseEntity.ok(healthSafetyService.getIncidents());
    }

    @PostMapping("/incidents")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> reportIncident(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(healthSafetyService.reportIncident(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/ppe")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getPpeAssignments() {
        return ResponseEntity.ok(healthSafetyService.getPpeAssignments());
    }

    @PostMapping("/ppe")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> assignPpe(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(healthSafetyService.assignPpe(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
