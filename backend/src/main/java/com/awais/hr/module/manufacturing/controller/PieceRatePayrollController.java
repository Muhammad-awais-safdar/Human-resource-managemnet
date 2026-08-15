package com.awais.hr.module.manufacturing.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/manufacturing/piece-rate")
public class PieceRatePayrollController {

    private final List<Map<String, Object>> productionLogs = new ArrayList<>();

    @PostMapping("/log")
    @HasPermission("corehr:employee:write")
    @RequiresModule("PIECE_RATE_FACTORY")
    public ResponseEntity<ApiResponse<Map<String, Object>>> logProductionUnit(@RequestBody Map<String, Object> payload) {
        String employeeId = (String) payload.getOrDefault("employeeId", "EMP-FACTORY-01");
        String jobName = (String) payload.getOrDefault("jobName", "Automotive Door Assembly");
        Integer unitsCompleted = Integer.parseInt(payload.getOrDefault("unitsCompleted", 150).toString());
        Double ratePerUnit = Double.parseDouble(payload.getOrDefault("ratePerUnit", 2.50).toString());

        Double totalEarned = unitsCompleted * ratePerUnit;

        Map<String, Object> logEntry = new HashMap<>();
        logEntry.put("id", UUID.randomUUID().toString());
        logEntry.put("employeeId", employeeId);
        logEntry.put("jobName", jobName);
        logEntry.put("unitsCompleted", unitsCompleted);
        logEntry.put("ratePerUnit", ratePerUnit);
        logEntry.put("totalEarned", totalEarned);
        logEntry.put("logDate", LocalDate.now().toString());

        productionLogs.add(logEntry);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Piece-rate production units logged successfully and calculated towards payroll line item",
            "logEntry", logEntry
        )));
    }

    @GetMapping("/logs")
    @HasPermission("corehr:employee:read")
    @RequiresModule("PIECE_RATE_FACTORY")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProductionLogs() {
        return ResponseEntity.ok(ApiResponse.success(productionLogs));
    }
}
