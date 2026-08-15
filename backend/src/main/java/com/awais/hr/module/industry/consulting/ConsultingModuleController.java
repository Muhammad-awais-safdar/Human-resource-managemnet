package com.awais.hr.module.industry.consulting;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/consulting")
public class ConsultingModuleController {

    @PostMapping("/profit-share/calculate")
    @HasPermission("corehr:settings:write")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculatePartnerProfitShare(@RequestBody Map<String, Object> payload) {
        Double totalQuarterlyProfitPool = Double.parseDouble(payload.getOrDefault("totalQuarterlyProfitPool", 1200000.00).toString());

        List<Map<String, Object>> partnerAllocations = List.of(
            Map.of("partner", "Equity Partner A", "equityPoints", 100, "shareAmount", Math.round(totalQuarterlyProfitPool * 0.50)),
            Map.of("partner", "Equity Partner B", "equityPoints", 60, "shareAmount", Math.round(totalQuarterlyProfitPool * 0.30)),
            Map.of("partner", "Managing Director C", "equityPoints", 40, "shareAmount", Math.round(totalQuarterlyProfitPool * 0.20))
        );

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "quarter", "Q2-2026",
            "totalQuarterlyProfitPool", totalQuarterlyProfitPool,
            "partnerAllocations", partnerAllocations
        )));
    }

    @GetMapping("/utilization-rate")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConsultantUtilizationRate() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "firmAverageUtilization", "84.2%",
            "targetUtilization", "80.0%",
            "billableHoursThisMonth", 14200,
            "benchHoursThisMonth", 2650,
            "status", "OPTIMAL_CAPACITY"
        )));
    }
}
