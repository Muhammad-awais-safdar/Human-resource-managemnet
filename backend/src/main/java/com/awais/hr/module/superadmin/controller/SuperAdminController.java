package com.awais.hr.module.superadmin.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.billing.service.PaymentGatewayService;
import com.awais.hr.module.superadmin.service.SuperAdminTenantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/suite/superadmin", "/superadmin", "/api/v1/superadmin"})
public class SuperAdminController {

    private final SuperAdminTenantService adminService;
    private final PaymentGatewayService paymentGatewayService;

    public SuperAdminController(SuperAdminTenantService adminService, PaymentGatewayService paymentGatewayService) {
        this.adminService = adminService;
        this.paymentGatewayService = paymentGatewayService;
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

    @GetMapping("/plans")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getAllPlansForAdmin() {
        return ResponseEntity.ok(paymentGatewayService.getAllPlansForAdmin());
    }

    @PostMapping("/plans")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> saveOrUpdatePlan(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(paymentGatewayService.saveOrUpdatePlan(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/tenants/deep-dive")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getTenantDeepDive() {
        return ResponseEntity.ok(adminService.getTenantDeepDive());
    }

    @PostMapping("/tenants/{id}/status")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updateTenantStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            String status = (String) body.get("status");
            return ResponseEntity.ok(adminService.updateTenantStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/tenants/{id}/extend-subscription")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> extendTenantSubscription(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            int days = body.get("days") != null ? ((Number) body.get("days")).intValue() : 30;
            return ResponseEntity.ok(adminService.extendTenantSubscription(id, days));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/tenants/{id}/users")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getTenantUsers(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getTenantUsers(id));
    }
}
