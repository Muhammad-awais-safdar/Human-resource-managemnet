package com.awais.hr.module.sso.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.sso.service.SsoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/sso")
public class SsoController {

    private final SsoService ssoService;

    public SsoController(SsoService ssoService) {
        this.ssoService = ssoService;
    }

    @GetMapping("/config")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getSsoConfig() {
        return ResponseEntity.ok(ssoService.getSsoConfig());
    }

    @PostMapping("/config")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updateSsoConfig(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(ssoService.updateSsoConfig(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/audit")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        return ResponseEntity.ok(ssoService.getAuditLogs());
    }
}
