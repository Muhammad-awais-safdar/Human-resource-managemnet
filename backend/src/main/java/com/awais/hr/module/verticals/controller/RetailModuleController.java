package com.awais.hr.module.verticals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/verticals/retail", "/verticals/retail"})
public class RetailModuleController {

    private final List<Map<String, Object>> posCommissions = new ArrayList<>(List.of(
            Map.of(
                    "id", "POS-301",
                    "storeLocation", "Downtown Flagship Store",
                    "associateName", "Jessica Taylor",
                    "registerId", "REG-04",
                    "salesVolume", 14500.00,
                    "commissionRatePct", 3.5,
                    "earnedCommission", 507.50,
                    "logDate", LocalDate.now().toString()
            )
    ));

    private final List<Map<String, Object>> openShifts = new ArrayList<>(List.of(
            Map.of(
                    "id", "BID-101",
                    "storeLocation", "Downtown Flagship Store",
                    "shiftSlot", "Weekend Rush (Sat 12 PM - 8 PM)",
                    "hourlyRateBonus", "+$2.50 / hr",
                    "status", "OPEN_FOR_BIDDING",
                    "bidsCount", 3
            )
    ));

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getRetailMetrics() {
        return ResponseEntity.ok(Map.of(
                "todayTotalPOSSales", 48900.00,
                "earnedCommissionsDisbursed", 1711.50,
                "openShiftSlotsForBidding", openShifts.size(),
                "activeStoreRegisters", 18,
                "shiftCoveragePct", 98.0
        ));
    }

    @GetMapping("/pos-commissions")
    public ResponseEntity<List<Map<String, Object>>> getPosCommissions() {
        return ResponseEntity.ok(posCommissions);
    }

    @PostMapping("/pos-commissions")
    public ResponseEntity<Map<String, Object>> logPosSales(@RequestBody Map<String, Object> payload) {
        String posId = "POS-" + (300 + posCommissions.size() + 1);
        double sales = payload.get("salesVolume") != null ? Double.parseDouble(payload.get("salesVolume").toString()) : 1000.0;
        double rate = payload.get("commissionRatePct") != null ? Double.parseDouble(payload.get("commissionRatePct").toString()) : 3.5;
        double commission = sales * (rate / 100.0);

        Map<String, Object> entry = new HashMap<>(payload);
        entry.put("id", posId);
        entry.put("earnedCommission", commission);
        entry.put("logDate", LocalDate.now().toString());
        posCommissions.add(0, entry);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "POS sales register sync and sales associate commission calculated",
                "entry", entry
        ));
    }

    @GetMapping("/shift-bidding")
    public ResponseEntity<List<Map<String, Object>>> getOpenShiftBidding() {
        return ResponseEntity.ok(openShifts);
    }
}
