package com.awais.hr.module.developerplatform.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.developerplatform.service.DeveloperPlatformService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/developer-platform")
public class DeveloperPlatformController {

    private final DeveloperPlatformService devService;

    public DeveloperPlatformController(DeveloperPlatformService devService) {
        this.devService = devService;
    }

    @GetMapping("/webhooks")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getWebhooks() {
        return ResponseEntity.ok(devService.getWebhooks());
    }

    @PostMapping("/webhooks")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> registerWebhook(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(devService.registerWebhook(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
