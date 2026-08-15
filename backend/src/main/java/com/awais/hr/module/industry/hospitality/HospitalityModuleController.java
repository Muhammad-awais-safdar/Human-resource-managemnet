package com.awais.hr.module.industry.hospitality;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hospitality")
public class HospitalityModuleController {

    @PostMapping("/tips/calculate-pool")
    @HasPermission("corehr:employee:write")
    @RequiresModule("RESTAURANT_TIPS")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateTipPool(@RequestBody Map<String, Object> payload) {
        Double totalPosTips = Double.parseDouble(payload.getOrDefault("totalPosTips", 1850.00).toString());
        Integer totalHoursWorked = Integer.parseInt(payload.getOrDefault("totalHoursWorked", 120).toString());

        Double hourlyTipRate = totalPosTips / totalHoursWorked;

        List<Map<String, Object>> distributions = List.of(
            Map.of("role", "Waitstaff (60%)", "staffCount", 5, "payoutPerStaff", Math.round((totalPosTips * 0.60 / 5) * 100.0) / 100.0),
            Map.of("role", "Kitchen & Line Cook (30%)", "staffCount", 4, "payoutPerStaff", Math.round((totalPosTips * 0.30 / 4) * 100.0) / 100.0),
            Map.of("role", "Busser & Host (10%)", "staffCount", 2, "payoutPerStaff", Math.round((totalPosTips * 0.10 / 2) * 100.0) / 100.0)
        );

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "shiftDate", LocalDate.now().toString(),
            "totalPosTips", totalPosTips,
            "hourlyTipRate", Math.round(hourlyTipRate * 100.0) / 100.0,
            "tipPoolDistributions", distributions
        )));
    }

    @PostMapping("/housekeeping/log-room")
    @HasPermission("corehr:employee:write")
    @RequiresModule("RESTAURANT_TIPS")
    public ResponseEntity<ApiResponse<Map<String, Object>>> logHousekeepingRoom(@RequestBody Map<String, Object> payload) {
        String housekeeperEmail = (String) payload.getOrDefault("housekeeperEmail", "housekeeping@hotel.com");
        Integer roomsCleaned = Integer.parseInt(payload.getOrDefault("roomsCleaned", 16).toString());
        Double creditPerRoom = Double.parseDouble(payload.getOrDefault("creditPerRoom", 7.50).toString());

        Double bonusEarned = roomsCleaned * creditPerRoom;

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "housekeeperEmail", housekeeperEmail,
            "roomsCleaned", roomsCleaned,
            "creditPerRoom", creditPerRoom,
            "totalBonusEarned", bonusEarned,
            "loggedDate", LocalDate.now().toString()
        )));
    }
}
