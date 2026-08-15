package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/v1/consulting")
@CrossOrigin(origins = "*")
public class ConsultingModuleController {

    // 1. Partner Profit Share Dividend Calculator
    @PostMapping("/profit-share/calculate")
    @HasPermission("payroll:process")
    public ResponseEntity<?> calculatePartnerProfitShare(@RequestBody Map<String, Object> body) {
        BigDecimal totalProfitPool = new BigDecimal(body.getOrDefault("totalProfitPool", "1000000.00").toString());
        BigDecimal equityPoints = new BigDecimal(body.getOrDefault("equityPoints", "15.0").toString()); // 15% equity tier
        BigDecimal totalEquityPoints = new BigDecimal(body.getOrDefault("totalEquityPoints", "100.0").toString());

        BigDecimal payout = totalProfitPool.multiply(equityPoints).divide(totalEquityPoints, 2, RoundingMode.HALF_UP);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalProfitPool", totalProfitPool,
                "equityPoints", equityPoints,
                "calculatedDividend", payout
        ));
    }

    // 2. Consultant Billable Utilization Rate & Bench Analytics
    @GetMapping("/utilization/analytics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getConsultantUtilization() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "overallBillableUtilizationPercent", 84.5,
                "totalConsultants", 120,
                "activeClientProjects", 95,
                "benchConsultants", 15,
                "targetUtilizationPercent", 80.0,
                "benchStatus", "OPTIMAL"
        ));
    }
}
