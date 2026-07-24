package com.awais.hr.module.auditcenter.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.auditcenter.service.AuditCenterService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/audit-center")
public class AuditCenterController {

    private final AuditCenterService auditCenterService;

    public AuditCenterController(AuditCenterService auditCenterService) {
        this.auditCenterService = auditCenterService;
    }

    @GetMapping("/logs")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getLogs() {
        return ResponseEntity.ok(auditCenterService.getLogs());
    }

    @PostMapping("/logs")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> recordAuditLog(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(auditCenterService.recordAuditLog(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/export")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<String> exportCsv() {
        String csv = auditCenterService.exportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_ledger.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }
}
