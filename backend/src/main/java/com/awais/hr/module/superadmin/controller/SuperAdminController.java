package com.awais.hr.module.superadmin.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.superadmin.service.SuperAdminTenantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/superadmin")
public class SuperAdminController {

    private final SuperAdminTenantService adminService;

    public SuperAdminController(SuperAdminTenantService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/logs")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getLogs() {
        return ResponseEntity.ok(adminService.getLogs());
    }

    @PostMapping("/logs")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> logTenantAction(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(adminService.logTenantAction(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
