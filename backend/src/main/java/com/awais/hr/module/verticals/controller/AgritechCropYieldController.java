package com.awais.hr.module.verticals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/verticals/agritech", "/verticals/agritech"})
public class AgritechCropYieldController {

    private final List<Map<String, Object>> harvestLogs = new ArrayList<>(List.of(
            Map.of(
                    "id", "AGRI-1001",
                    "fieldSector", "Sector A-3 (Organic Wheat)",
                    "cropType", "Organic Hard Red Wheat",
                    "harvestDate", LocalDate.now().minusDays(1).toString(),
                    "acreageHarvested", 14.5,
                    "yieldWeightKg", 18450.0,
                    "qualityGrade", "GRADE_A_PREMIUM",
                    "workerCount", 12,
                    "pieceRateWagePerKg", 0.45,
                    "totalLaborCost", 8302.50
            ),
            Map.of(
                    "id", "AGRI-1002",
                    "fieldSector", "Sector B-1 (Valencia Oranges)",
                    "cropType", "Valencia Citrus",
                    "harvestDate", LocalDate.now().toString(),
                    "acreageHarvested", 8.2,
                    "yieldWeightKg", 9200.0,
                    "qualityGrade", "GRADE_A_PREMIUM",
                    "workerCount", 8,
                    "pieceRateWagePerKg", 0.60,
                    "totalLaborCost", 5520.00
            )
    ));

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getAgritechMetrics() {
        double totalYield = harvestLogs.stream().mapToDouble(l -> (Double) l.get("yieldWeightKg")).sum();
        double totalCost = harvestLogs.stream().mapToDouble(l -> (Double) l.get("totalLaborCost")).sum();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalHarvestTonnageKg", totalYield);
        metrics.put("activeFieldSectors", 8);
        metrics.put("seasonalTargetCompletionPct", 78.4);
        metrics.put("totalLaborDisbursements", totalCost);
        metrics.put("activeFarmWorkersCount", 45);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/harvest-logs")
    public ResponseEntity<List<Map<String, Object>>> getHarvestLogs() {
        return ResponseEntity.ok(harvestLogs);
    }

    @PostMapping("/harvest-logs")
    public ResponseEntity<Map<String, Object>> recordHarvestLog(@RequestBody Map<String, Object> payload) {
        String logId = "AGRI-" + (1000 + harvestLogs.size() + 1);
        double yieldWeight = payload.get("yieldWeightKg") != null ? Double.parseDouble(payload.get("yieldWeightKg").toString()) : 1000.0;
        double rate = payload.get("pieceRateWagePerKg") != null ? Double.parseDouble(payload.get("pieceRateWagePerKg").toString()) : 0.50;
        double totalLaborCost = yieldWeight * rate;

        Map<String, Object> entry = new HashMap<>(payload);
        entry.put("id", logId);
        entry.put("harvestDate", LocalDate.now().toString());
        entry.put("totalLaborCost", totalLaborCost);
        harvestLogs.add(0, entry);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Agritech harvest log and piece-rate labor wage recorded successfully",
                "entry", entry
        ));
    }
}
