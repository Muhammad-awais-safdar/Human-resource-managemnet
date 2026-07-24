package com.awais.hr.module.integration.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.integration.service.IntegrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/integrations")
public class IntegrationController {

    private final IntegrationService integrationService;

    public IntegrationController(IntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    // ── OAuth Integrations ──────────────────────────────────────────────────────

    @GetMapping
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getIntegrations() {
        return ResponseEntity.ok(integrationService.getIntegrations());
    }

    @PostMapping
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> upsertIntegration(@RequestBody Map<String, String> body) {
        try {
            integrationService.upsertIntegration(
                    body.get("provider"),
                    body.get("clientId"),
                    body.get("clientSecret"),
                    body.get("settingsJson")
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Integration saved."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> toggleIntegration(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        integrationService.toggleIntegration(id, active);
        return ResponseEntity.ok(Map.of("success", true, "message", "Integration toggled."));
    }

    // ── Webhooks ────────────────────────────────────────────────────────────────

    @GetMapping("/webhooks")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getWebhooks() {
        return ResponseEntity.ok(integrationService.getWebhooks());
    }

    @PostMapping("/webhooks")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> addWebhook(@RequestBody Map<String, String> body) {
        try {
            integrationService.addWebhook(
                    body.get("targetUrl"),
                    body.get("description"),
                    body.get("secret"),
                    body.get("eventsJson")
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Webhook registered."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/webhooks/{id}")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> deleteWebhook(@PathVariable String id) {
        integrationService.deleteWebhook(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Webhook deleted."));
    }
}
