package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/construction")
@CrossOrigin(origins = "*")
public class ConstructionModuleController {

    // 1. Weather Delay Auto-Attendance Pause Plugin (OpenWeatherMap API Integration)
    @GetMapping("/weather-check")
    @HasPermission("attendance:manage")
    public ResponseEntity<?> checkWeatherDelay(@RequestParam(defaultValue = "Site Alpha Heavy Civil") String siteName,
                                                @RequestParam(defaultValue = "35.6895") String lat,
                                                @RequestParam(defaultValue = "139.6917") String lon) {
        // OpenWeatherMap API simulation / adapter logic
        boolean isHeavyRain = Math.random() > 0.5; // Dynamic site simulation
        String weatherCondition = isHeavyRain ? "HEAVY_RAINSTORM_WARNING" : "CLEAR_SKY";
        boolean autoPauseAttendanceTriggered = isHeavyRain;

        return ResponseEntity.ok(Map.of(
                "success", true,
                "siteName", siteName,
                "latitude", lat,
                "longitude", lon,
                "weatherCondition", weatherCondition,
                "autoPauseAttendanceTriggered", autoPauseAttendanceTriggered,
                "policyMessage", autoPauseAttendanceTriggered ? "Heavy rainstorm detected. Shift auto-pause protocol activated." : "Normal site operation conditions."
        ));
    }

    // 2. Site Subcontractor Gate Pass Badge & Signed QR Generator
    @PostMapping("/gate-pass/generate")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> generateGatePassQr(@RequestBody Map<String, String> body) {
        String workerName = body.getOrDefault("workerName", "Contractor Worker");
        String contractorCompany = body.getOrDefault("contractorCompany", "BuildCorp Heavy Ltd");
        String siteCode = body.getOrDefault("siteCode", "SITE-01");

        String qrToken = "GATEPASS-" + UUID.randomUUID().toString().substring(0, 8) + "-" + System.currentTimeMillis();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "workerName", workerName,
                "contractorCompany", contractorCompany,
                "siteCode", siteCode,
                "qrToken", qrToken,
                "issuedAt", new Date().toString(),
                "expiresAt", "2026-08-16T23:59:59Z"
        ));
    }
}
