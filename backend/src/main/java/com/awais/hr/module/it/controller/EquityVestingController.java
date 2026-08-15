package com.awais.hr.module.it.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/equity")
public class EquityVestingController {

    private final List<Map<String, Object>> grantsDb = new ArrayList<>();

    public EquityVestingController() {
        // Seed default sample grant for demo
        Map<String, Object> grant = new HashMap<>();
        grant.put("id", UUID.randomUUID().toString());
        grant.put("employeeEmail", "developer@company.com");
        grant.put("grantNumber", "EQ-2026-001");
        grant.put("totalShares", 10000);
        grant.put("vestedShares", 2500);
        grant.put("exercisePriceUsd", 1.50);
        grant.put("grantDate", LocalDate.now().minusYears(1).toString());
        grant.put("cliffMonths", 12);
        grant.put("vestingPeriodMonths", 48);
        grant.put("status", "ACTIVE_VESTING");
        grantsDb.add(grant);
    }

    @GetMapping("/grants")
    @HasPermission("corehr:employee:read")
    @RequiresModule("EQUITY_VESTING")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllEquityGrants() {
        return ResponseEntity.ok(ApiResponse.success(grantsDb));
    }

    @PostMapping("/grants")
    @HasPermission("corehr:settings:write")
    @RequiresModule("EQUITY_VESTING")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createGrant(@RequestBody Map<String, Object> payload) {
        Map<String, Object> grant = new HashMap<>(payload);
        grant.put("id", UUID.randomUUID().toString());
        grant.put("grantDate", LocalDate.now().toString());
        grant.put("status", "ACTIVE_VESTING");
        
        Integer total = Integer.parseInt(payload.getOrDefault("totalShares", 5000).toString());
        grant.put("totalShares", total);
        grant.put("vestedShares", 0);

        grantsDb.add(grant);
        return ResponseEntity.ok(ApiResponse.success(grant));
    }
}
