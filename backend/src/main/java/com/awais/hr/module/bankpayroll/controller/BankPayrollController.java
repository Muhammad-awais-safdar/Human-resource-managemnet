package com.awais.hr.module.bankpayroll.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.bankpayroll.service.BankPayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/bank-payroll")
public class BankPayrollController {

    private final BankPayrollService bankPayrollService;

    public BankPayrollController(BankPayrollService bankPayrollService) {
        this.bankPayrollService = bankPayrollService;
    }

    @GetMapping("/batches")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getBankBatches() {
        return ResponseEntity.ok(bankPayrollService.getBankBatches());
    }

    @PostMapping("/batches")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createBatch(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(bankPayrollService.createBatch(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/batches/{batchId}/export")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<Map<String, Object>> exportFile(@PathVariable String batchId, @RequestParam(defaultValue = "NACHA") String format) {
        return ResponseEntity.ok(bankPayrollService.exportFile(batchId, format));
    }
}
