package com.awais.hr.module.businesscontinuity.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.businesscontinuity.service.BusinessContinuityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/business-continuity")
public class BusinessContinuityController {

    private final BusinessContinuityService bcService;

    public BusinessContinuityController(BusinessContinuityService bcService) {
        this.bcService = bcService;
    }

    @GetMapping("/backups")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getBackups() {
        return ResponseEntity.ok(bcService.getBackups());
    }

    @PostMapping("/backups")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> triggerBackup(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(bcService.triggerBackup(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
