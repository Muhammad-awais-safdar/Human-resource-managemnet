package com.awais.hr.module.mobileenterprise.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.mobileenterprise.service.MobileEnterpriseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/mobile-enterprise")
public class MobileEnterpriseController {

    private final MobileEnterpriseService mobileService;

    public MobileEnterpriseController(MobileEnterpriseService mobileService) {
        this.mobileService = mobileService;
    }

    @GetMapping("/devices")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getDevices() {
        return ResponseEntity.ok(mobileService.getDevices());
    }

    @PostMapping("/devices")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> registerDevice(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(mobileService.registerDevice(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
