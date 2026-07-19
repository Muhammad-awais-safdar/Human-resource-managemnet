package com.awais.hr.module.settings.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.settings.service.PlatformSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/suite/settings")
public class PlatformSettingsController {

    private final PlatformSettingsService platformSettingsService;

    public PlatformSettingsController(PlatformSettingsService platformSettingsService) {
        this.platformSettingsService = platformSettingsService;
    }

    @GetMapping
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(platformSettingsService.getSettings());
    }

    @PutMapping
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> body) {
        platformSettingsService.updateSettings(body);
        return ResponseEntity.ok(Map.of("success", true, "message", "Branding & settings updated."));
    }
}
