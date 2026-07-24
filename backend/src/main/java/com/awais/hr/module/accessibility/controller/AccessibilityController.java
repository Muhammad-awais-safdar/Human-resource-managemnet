package com.awais.hr.module.accessibility.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.accessibility.service.AccessibilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/suite/accessibility")
public class AccessibilityController {

    private final AccessibilityService accessibilityService;

    public AccessibilityController(AccessibilityService accessibilityService) {
        this.accessibilityService = accessibilityService;
    }

    @GetMapping("/preferences")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getPreferences() {
        return ResponseEntity.ok(accessibilityService.getPreferences());
    }

    @PostMapping("/preferences")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updatePreferences(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(accessibilityService.updatePreferences(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
