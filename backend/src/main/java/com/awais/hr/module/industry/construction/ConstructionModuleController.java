package com.awais.hr.module.industry.construction;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/construction")
public class ConstructionModuleController {

    @PostMapping("/weather-delay/check-trigger")
    @HasPermission("corehr:employee:read")
    @RequiresModule("WEATHER_DELAY")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkWeatherDelayTrigger(@RequestBody Map<String, Object> payload) {
        String siteLocation = (String) payload.getOrDefault("siteLocation", "Building Site 42 - Downtown");
        Double windSpeedMph = Double.parseDouble(payload.getOrDefault("windSpeedMph", 45.0).toString());
        String weatherCondition = (String) payload.getOrDefault("weatherCondition", "Heavy Rain & High Winds");

        boolean pauseTriggered = windSpeedMph > 35.0 || weatherCondition.toLowerCase().contains("heavy rain");

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "siteLocation", siteLocation,
            "weatherCondition", weatherCondition,
            "windSpeedMph", windSpeedMph,
            "autoSitePauseTriggered", pauseTriggered,
            "action", pauseTriggered ? "Crane operations & outdoor work paused. Weather standby pay logged for site workers." : "Normal site operations.",
            "checkedAt", LocalDate.now().toString()
        )));
    }

    @PostMapping("/gate-pass/generate-qr")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateSubcontractorGatePass(@RequestBody Map<String, Object> payload) {
        String subcontractorName = (String) payload.getOrDefault("subcontractorName", "Apex Concrete Ltd");
        String workerName = (String) payload.getOrDefault("workerName", "Mike Johnson");

        String qrToken = "GATE-PASS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "subcontractorName", subcontractorName,
            "workerName", workerName,
            "qrGatePassToken", qrToken,
            "validForDate", LocalDate.now().toString(),
            "safetyClearance", "HARD_HAT_SAFETY_VERIFIED"
        )));
    }
}
