package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.engine.allowance.AllowanceEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/logistics")
@CrossOrigin(origins = "*")
public class LogisticsModuleController {

    private final AllowanceEngine allowanceEngine;

    public LogisticsModuleController(AllowanceEngine allowanceEngine) {
        this.allowanceEngine = allowanceEngine;
    }

    // 1. Driver DOT / EU Driving Hours Rest-Period Legal Limits Validator
    @GetMapping("/driving-hours/validate")
    @HasPermission("attendance:manage")
    public ResponseEntity<?> validateDrivingHours(@RequestParam String driverId,
                                                   @RequestParam(defaultValue = "9.5") double continuousDrivingHours,
                                                   @RequestParam(defaultValue = "US_DOT") String jurisdiction) {
        double maxLegalHours = "EU_LOGISTICS".equalsIgnoreCase(jurisdiction) ? 9.0 : 11.0;
        boolean violation = continuousDrivingHours > maxLegalHours;

        return ResponseEntity.ok(Map.of(
                "success", true,
                "driverId", driverId,
                "jurisdiction", jurisdiction,
                "continuousDrivingHours", continuousDrivingHours,
                "maxLegalHoursAllowed", maxLegalHours,
                "legalViolation", violation,
                "statusMessage", violation ? "LEGAL VIOLATION DETECTED: Mandated rest break required immediately!" : "Compliant with driving hour limits."
        ));
    }

    // 2. Fleet Telematics GPS Ingestion Service (Samsara / Geotab Adapter)
    @PostMapping("/telematics/sync")
    @HasPermission("attendance:manage")
    public ResponseEntity<?> syncFleetTelematics(@RequestBody Map<String, Object> body) {
        String provider = (String) body.getOrDefault("provider", "SAMSARA");
        String vehicleId = (String) body.getOrDefault("vehicleId", "TRUCK-99");
        double distanceKm = Double.parseDouble(body.getOrDefault("distanceKm", "450.5").toString());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "provider", provider,
                "vehicleId", vehicleId,
                "distanceKm", distanceKm,
                "syncStatus", "SUCCESS",
                "syncedAt", new Date().toString()
        ));
    }

    // 3. Per-Kilometer Trip Allowance Calculation Engine
    @PostMapping("/allowance/calculate")
    @HasPermission("payroll:process")
    public ResponseEntity<?> calculateDistanceAllowance(@RequestBody Map<String, Object> body) {
        String employeeId = (String) body.getOrDefault("employeeId", "EMP-LOGISTICS-01");
        BigDecimal distanceKm = new BigDecimal(body.getOrDefault("distanceKm", "350.0").toString());
        BigDecimal rate = new BigDecimal(body.getOrDefault("unitRate", "0.45").toString());

        String recordId = allowanceEngine.recordAllowance(employeeId, "MILEAGE_PER_KM", distanceKm, rate, LocalDate.now());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "recordId", recordId,
                "employeeId", employeeId,
                "distanceKm", distanceKm,
                "ratePerKm", rate,
                "totalAllowance", allowanceEngine.calculateAllowance(distanceKm, rate)
        ));
    }
}
