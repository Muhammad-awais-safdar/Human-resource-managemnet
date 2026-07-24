package com.awais.hr.module.bankpayroll.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.bankpayroll.service.PayrollDisbursementGatewayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/suite/payroll-disbursement")
public class PayrollDisbursementController {

    private final PayrollDisbursementGatewayService disbursementGatewayService;

    public PayrollDisbursementController(PayrollDisbursementGatewayService disbursementGatewayService) {
        this.disbursementGatewayService = disbursementGatewayService;
    }

    @PostMapping("/config")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> configureProvider(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(disbursementGatewayService.configureProvider(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/batches/{batchId}/disburse")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> executeDisbursement(
            @PathVariable String batchId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey) {
        try {
            return ResponseEntity.accepted().body(disbursementGatewayService.executeDisbursement(batchId, body, idempotencyKey));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/batches/{batchId}/status")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getBatchStatus(@PathVariable String batchId) {
        return ResponseEntity.ok(disbursementGatewayService.getBatchStatus(batchId));
    }
}
