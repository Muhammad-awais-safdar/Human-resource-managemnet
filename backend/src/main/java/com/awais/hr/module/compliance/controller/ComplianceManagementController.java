package com.awais.hr.module.compliance.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.compliance.service.ComplianceManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/compliance-management")
public class ComplianceManagementController {

    private final ComplianceManagementService complianceService;

    public ComplianceManagementController(ComplianceManagementService complianceService) {
        this.complianceService = complianceService;
    }

    @GetMapping("/checklists")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getChecklists() {
        return ResponseEntity.ok(complianceService.getChecklists());
    }

    @PostMapping("/checklists")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createChecklist(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(complianceService.createChecklist(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/risks")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getRiskAssessments() {
        return ResponseEntity.ok(complianceService.getRiskAssessments());
    }

    @PostMapping("/risks")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createRiskAssessment(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(complianceService.createRiskAssessment(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/acknowledgements")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getPolicyAcknowledgements() {
        return ResponseEntity.ok(complianceService.getPolicyAcknowledgements());
    }

    @PostMapping("/acknowledge")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> acknowledgePolicy(@AuthenticationPrincipal UserDetails user, @RequestBody Map<String, Object> body) {
        try {
            String email = user != null ? user.getUsername() : "system@company.com";
            return ResponseEntity.ok(complianceService.acknowledgePolicy(email, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
