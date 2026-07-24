package com.awais.hr.module.approvals.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.approvals.service.UnifiedApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/approvals")
public class UnifiedApprovalController {

    private final UnifiedApprovalService approvalService;

    public UnifiedApprovalController(UnifiedApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping("/counts")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getPendingCounts() {
        return ResponseEntity.ok(approvalService.getPendingCounts());
    }

    @GetMapping("/delegations")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getDelegations() {
        return ResponseEntity.ok(approvalService.getDelegations());
    }

    @PostMapping("/delegate")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> delegateApproval(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(approvalService.delegateApproval(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
