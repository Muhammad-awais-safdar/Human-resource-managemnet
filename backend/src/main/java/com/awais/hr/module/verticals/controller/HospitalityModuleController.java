package com.awais.hr.module.verticals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/verticals/hospitality", "/verticals/hospitality"})
public class HospitalityModuleController {

    private final List<Map<String, Object>> tipPools = new ArrayList<>(List.of(
            Map.of(
                    "id", "TIP-901",
                    "outlet", "Main Dining Room & Terrace Bar",
                    "shiftType", "DINNER_SHIFT",
                    "shiftDate", LocalDate.now().toString(),
                    "totalGratuityCollected", 2450.00,
                    "waitstaffSharePct", 70.0,
                    "kitchenSharePct", 20.0,
                    "busserSharePct", 10.0,
                    "staffCount", 14,
                    "perStaffAvgPayout", 175.00
            )
    ));

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getHospitalityMetrics() {
        return ResponseEntity.ok(Map.of(
                "todayTotalGratuityPool", 2450.00,
                "activeOutletsCount", 4,
                "foodSafetyPermitValidityPct", 100.0,
                "shiftCoveragePct", 96.5,
                "activeHospitalityStaff", 38
        ));
    }

    @GetMapping("/tip-pools")
    public ResponseEntity<List<Map<String, Object>>> getTipPools() {
        return ResponseEntity.ok(tipPools);
    }

    @PostMapping("/tip-pools")
    public ResponseEntity<Map<String, Object>> logTipPool(@RequestBody Map<String, Object> payload) {
        String tipId = "TIP-" + (900 + tipPools.size() + 1);
        double totalGratuity = payload.get("totalGratuityCollected") != null ? Double.parseDouble(payload.get("totalGratuityCollected").toString()) : 1000.0;
        int count = payload.get("staffCount") != null ? Integer.parseInt(payload.get("staffCount").toString()) : 10;
        double avg = totalGratuity / (count > 0 ? count : 1);

        Map<String, Object> entry = new HashMap<>(payload);
        entry.put("id", tipId);
        entry.put("shiftDate", LocalDate.now().toString());
        entry.put("perStaffAvgPayout", avg);
        tipPools.add(0, entry);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Shift tip pool gratuity distribution calculated and saved",
                "entry", entry
        ));
    }
}
