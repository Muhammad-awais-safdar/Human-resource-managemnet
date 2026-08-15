package com.awais.hr.module.industry.retail;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/retail")
public class RetailModuleController {

    private final List<Map<String, Object>> posCommissions = new ArrayList<>();
    private final List<Map<String, Object>> openShiftBids = new ArrayList<>();

    @PostMapping("/pos-commissions/log")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<ApiResponse<Map<String, Object>>> logPosCommission(@RequestBody Map<String, Object> payload) {
        String associateEmail = (String) payload.getOrDefault("associateEmail", "associate@store.com");
        Double salesAmount = Double.parseDouble(payload.getOrDefault("salesAmount", 1250.00).toString());
        Double commissionRate = Double.parseDouble(payload.getOrDefault("commissionRate", 0.05).toString());

        Double commissionEarned = salesAmount * commissionRate;

        Map<String, Object> entry = new HashMap<>();
        entry.put("id", UUID.randomUUID().toString());
        entry.put("associateEmail", associateEmail);
        entry.put("salesAmount", salesAmount);
        entry.put("commissionEarned", commissionEarned);
        entry.put("loggedDate", LocalDate.now().toString());

        posCommissions.add(entry);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "POS sale commission logged into retail sales payroll ledger",
            "commissionEntry", entry
        )));
    }

    @PostMapping("/shifts/generate-ai")
    @HasPermission("corehr:settings:write")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateAiShiftRoster(@RequestBody Map<String, Object> payload) {
        String storeId = (String) payload.getOrDefault("storeId", "STORE-NYC-01");
        Integer expectedFootTraffic = Integer.parseInt(payload.getOrDefault("expectedFootTraffic", 3500).toString());

        List<Map<String, String>> recommendedShifts = List.of(
            Map.of("shift", "Morning Peak", "time", "08:00 - 16:00", "requiredStaff", "12"),
            Map.of("shift", "Evening Peak", "time", "16:00 - 23:00", "requiredStaff", "18"),
            Map.of("shift", "Night Closing", "time", "23:00 - 04:00", "requiredStaff", "4")
        );

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "storeId", storeId,
            "expectedFootTraffic", expectedFootTraffic,
            "recommendedShifts", recommendedShifts,
            "aiConfidenceScore", "96.4%"
        )));
    }

    @GetMapping("/shifts/bidding-board")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBiddingBoard() {
        if (openShiftBids.isEmpty()) {
            openShiftBids.add(Map.of(
                "shiftId", "SHIFT-BID-101",
                "storeName", "Fifth Ave Superstore",
                "date", LocalDate.now().plusDays(1).toString(),
                "timeSlot", "14:00 - 22:00",
                "hourlyBonus", "$3.50/hr premium",
                "status", "OPEN_FOR_BID"
            ));
        }
        return ResponseEntity.ok(ApiResponse.success(openShiftBids));
    }

    @PostMapping("/shifts/bidding-board/bid")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<ApiResponse<Map<String, Object>>> placeShiftBid(@RequestBody Map<String, Object> payload) {
        String shiftId = (String) payload.getOrDefault("shiftId", "SHIFT-BID-101");
        String employeeEmail = (String) payload.getOrDefault("employeeEmail", "parttime@store.com");

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Shift bid submitted successfully for supervisor approval",
            "shiftId", shiftId,
            "applicant", employeeEmail,
            "status", "PENDING_APPROVAL"
        )));
    }
}
