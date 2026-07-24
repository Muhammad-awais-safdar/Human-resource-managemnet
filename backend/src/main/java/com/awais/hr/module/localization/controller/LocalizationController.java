package com.awais.hr.module.localization.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.localization.service.LocalizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/suite/localization")
public class LocalizationController {

    private final LocalizationService localizationService;

    public LocalizationController(LocalizationService localizationService) {
        this.localizationService = localizationService;
    }

    @GetMapping("/settings")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getLocaleSettings() {
        return ResponseEntity.ok(localizationService.getLocaleSettings());
    }

    @PostMapping("/settings")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updateLocaleSettings(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(localizationService.updateLocaleSettings(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
