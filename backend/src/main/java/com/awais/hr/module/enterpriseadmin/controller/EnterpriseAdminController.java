package com.awais.hr.module.enterpriseadmin.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.enterpriseadmin.service.EnterpriseAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/suite/enterprise-admin")
public class EnterpriseAdminController {

    private final EnterpriseAdminService adminService;

    public EnterpriseAdminController(EnterpriseAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/settings")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getAdminSettings() {
        return ResponseEntity.ok(adminService.getAdminSettings());
    }

    @PostMapping("/settings")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updateAdminSettings(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(adminService.updateAdminSettings(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
