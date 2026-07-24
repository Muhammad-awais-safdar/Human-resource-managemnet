package com.awais.hr.module.platformoperations.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.platformoperations.service.PlatformOperationsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/platform-operations")
public class PlatformOperationsController {

    private final PlatformOperationsService opsService;

    public PlatformOperationsController(PlatformOperationsService opsService) {
        this.opsService = opsService;
    }

    @GetMapping("/logs")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getLogs() {
        return ResponseEntity.ok(opsService.getLogs());
    }

    @PostMapping("/logs")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> recordLog(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(opsService.recordLog(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
