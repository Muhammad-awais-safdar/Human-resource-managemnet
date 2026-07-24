package com.awais.hr.module.compliance.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.compliance.service.ComplianceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/compliance")
public class ComplianceController {

    private final ComplianceService complianceService;

    public ComplianceController(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }

    @PostMapping("/consent")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> saveConsent(@AuthenticationPrincipal UserDetails user,
                                         @RequestBody Map<String, Boolean> body) {
        Boolean given = body.get("consentGiven");
        if (given == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "consentGiven parameter is required."));
        }
        complianceService.saveGdprConsent(getUsername(user), given);
        return ResponseEntity.ok(Map.of("success", true, "message", "Consent settings updated."));
    }

    @GetMapping("/consent")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getConsent(@AuthenticationPrincipal UserDetails user) {
        Map<String, Object> consent = complianceService.getGdprConsent(getUsername(user));
        return ResponseEntity.ok(consent);
    }

    @GetMapping("/audits")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getAudits() {
        return ResponseEntity.ok(complianceService.getAuditLogs());
    }

    @PostMapping("/purge")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> runPurge() {
        int deletedCount = complianceService.runDataRetentionPurge();
        return ResponseEntity.ok(Map.of("success", true, "message", "Purge completed. Rows deleted: " + deletedCount));
    }

    private String getUsername(UserDetails user) {
        return user != null ? user.getUsername() : "system@company.com";
    }
}
