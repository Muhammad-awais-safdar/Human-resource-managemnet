package com.awais.hr.module.industry.logistics;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/logistics")
public class LogisticsModuleController {

    @PostMapping("/dot/validate-hours")
    @HasPermission("corehr:employee:read")
    @RequiresModule("DRIVER_DOT")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateDriverDotHours(@RequestBody Map<String, Object> payload) {
        String driverEmail = (String) payload.getOrDefault("driverEmail", "driver.sam@fleet.com");
        Double hoursDrivenToday = Double.parseDouble(payload.getOrDefault("hoursDrivenToday", 10.5).toString());

        boolean complianceViolation = hoursDrivenToday > 11.0;

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "driverEmail", driverEmail,
            "hoursDrivenToday", hoursDrivenToday,
            "maxLegalDotHours", 11.0,
            "complianceStatus", complianceViolation ? "DOT_HOURS_VIOLATION_REST_REQUIRED" : "COMPLIANT",
            "requiredRestHours", complianceViolation ? 10.0 : 0.0
        )));
    }

    @PostMapping("/telematics/sync-samsara")
    @HasPermission("corehr:settings:write")
    @RequiresModule("TELEMATICS_GPS")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncSamsaraTelematics(@RequestBody Map<String, Object> payload) {
        String vehicleId = (String) payload.getOrDefault("vehicleId", "TRUCK-9901");
        Double milesTraveled = Double.parseDouble(payload.getOrDefault("milesTraveled", 420.5).toString());
        Double engineRuntimeHours = Double.parseDouble(payload.getOrDefault("engineRuntimeHours", 8.2).toString());

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "vehicleId", vehicleId,
            "milesTraveled", milesTraveled,
            "engineRuntimeHours", engineRuntimeHours,
            "syncProvider", "Samsara / Geotab Fleet API Gateway",
            "syncedAt", LocalDate.now().toString()
        )));
    }

    @PostMapping("/trip-allowance/calculate")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateTripAllowance(@RequestBody Map<String, Object> payload) {
        Double totalKm = Double.parseDouble(payload.getOrDefault("totalKm", 650.0).toString());
        Double perKmRate = Double.parseDouble(payload.getOrDefault("perKmRate", 0.35).toString());

        Double totalAllowance = totalKm * perKmRate;

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "totalKm", totalKm,
            "perKmRate", perKmRate,
            "totalTripAllowanceUsd", totalAllowance,
            "loggedDate", LocalDate.now().toString()
        )));
    }
}
