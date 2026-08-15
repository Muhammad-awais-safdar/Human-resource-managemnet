package com.awais.hr.module.verticals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/verticals/manufacturing", "/verticals/manufacturing"})
public class ManufacturingModuleController {

    private final List<Map<String, Object>> pieceRateWages = new ArrayList<>(List.of(
            Map.of(
                    "id", "MFG-701",
                    "assemblyLine", "Line 4 (Automotive Chassis)",
                    "workerName", "Robert Chen",
                    "unitsProduced", 420,
                    "pieceRatePerUnit", 1.85,
                    "shiftDate", LocalDate.now().toString(),
                    "totalWage", 777.00
            ),
            Map.of(
                    "id", "MFG-702",
                    "assemblyLine", "Line 2 (EV Battery Packs)",
                    "workerName", "Maria Garcia",
                    "unitsProduced", 185,
                    "pieceRatePerUnit", 4.50,
                    "shiftDate", LocalDate.now().toString(),
                    "totalWage", 832.50
            )
    ));

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getManufacturingMetrics() {
        double totalUnits = pieceRateWages.stream().mapToDouble(p -> Double.parseDouble(p.get("unitsProduced").toString())).sum();
        double totalWages = pieceRateWages.stream().mapToDouble(p -> Double.parseDouble(p.get("totalWage").toString())).sum();

        return ResponseEntity.ok(Map.of(
                "todayTotalUnitsProduced", totalUnits,
                "activeAssemblyLines", 6,
                "biometricGatewayUptimePct", 99.9,
                "totalPieceRateLaborDisbursement", totalWages,
                "oshaIncidentsZeroStreakDays", 142
        ));
    }

    @GetMapping("/piece-rate-wages")
    public ResponseEntity<List<Map<String, Object>>> getPieceRateWages() {
        return ResponseEntity.ok(pieceRateWages);
    }

    @PostMapping("/piece-rate-wages")
    public ResponseEntity<Map<String, Object>> logPieceRateOutput(@RequestBody Map<String, Object> payload) {
        String logId = "MFG-" + (700 + pieceRateWages.size() + 1);
        double units = payload.get("unitsProduced") != null ? Double.parseDouble(payload.get("unitsProduced").toString()) : 100.0;
        double rate = payload.get("pieceRatePerUnit") != null ? Double.parseDouble(payload.get("pieceRatePerUnit").toString()) : 2.0;
        double total = units * rate;

        Map<String, Object> entry = new HashMap<>(payload);
        entry.put("id", logId);
        entry.put("shiftDate", LocalDate.now().toString());
        entry.put("totalWage", total);
        pieceRateWages.add(0, entry);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Factory assembly line piece-rate output logged successfully",
                "entry", entry
        ));
    }
}
