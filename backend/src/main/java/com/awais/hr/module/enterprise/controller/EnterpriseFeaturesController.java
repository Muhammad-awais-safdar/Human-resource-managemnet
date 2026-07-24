package com.awais.hr.module.enterprise.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.enterprise.service.EnterpriseFeaturesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/enterprise")
public class EnterpriseFeaturesController {

    private final EnterpriseFeaturesService enterpriseFeaturesService;

    public EnterpriseFeaturesController(EnterpriseFeaturesService enterpriseFeaturesService) {
        this.enterpriseFeaturesService = enterpriseFeaturesService;
    }

    @PostMapping("/keys")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createKey(@AuthenticationPrincipal UserDetails user,
                                        @RequestBody Map<String, String> body) {
        try {
            String rawKey = enterpriseFeaturesService.generateApiKey(getUsername(user), body.get("name"));
            return ResponseEntity.ok(Map.of("success", true, "apiKey", rawKey));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/keys")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getKeys(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(enterpriseFeaturesService.getApiKeys(getUsername(user)));
    }

    @DeleteMapping("/keys/{id}")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> revokeKey(@PathVariable String id) {
        enterpriseFeaturesService.revokeApiKey(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "API Key revoked successfully."));
    }

    @PostMapping("/backups")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> triggerBackup() {
        Map<String, Object> backup = enterpriseFeaturesService.triggerTenantBackup();
        return ResponseEntity.ok(Map.of("success", true, "data", backup));
    }

    @GetMapping("/backups")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getBackups() {
        return ResponseEntity.ok(enterpriseFeaturesService.getBackups());
    }

    private String getUsername(UserDetails user) {
        return user != null ? user.getUsername() : "system@company.com";
    }
}
