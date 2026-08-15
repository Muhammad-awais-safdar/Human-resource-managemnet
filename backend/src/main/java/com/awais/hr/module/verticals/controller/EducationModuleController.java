package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/v1/education")
@CrossOrigin(origins = "*")
public class EducationModuleController {

    // 1. Faculty Lecture Credit & Overload Payroll Multiplier
    @PostMapping("/lecture-credit/calculate")
    @HasPermission("payroll:process")
    public ResponseEntity<?> calculateLectureCreditOverload(@RequestBody Map<String, Object> body) {
        String facultyId = (String) body.getOrDefault("facultyId", "FAC-01");
        int baseCreditHours = Integer.parseInt(body.getOrDefault("baseCreditHours", "12").toString());
        int actualTaughtHours = Integer.parseInt(body.getOrDefault("actualTaughtHours", "18").toString());
        BigDecimal hourlyRate = new BigDecimal(body.getOrDefault("hourlyRate", "75.00").toString());

        int overloadHours = Math.max(0, actualTaughtHours - baseCreditHours);
        BigDecimal basePay = hourlyRate.multiply(BigDecimal.valueOf(actualTaughtHours));
        BigDecimal overloadBonus = hourlyRate.multiply(BigDecimal.valueOf(overloadHours)).multiply(BigDecimal.valueOf(1.5));
        BigDecimal totalCompensation = basePay.add(overloadBonus).setScale(2, RoundingMode.HALF_UP);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "facultyId", facultyId,
                "baseCreditHours", baseCreditHours,
                "actualTaughtHours", actualTaughtHours,
                "overloadHours", overloadHours,
                "totalCompensation", totalCompensation
        ));
    }

    // 2. Tenure Track Milestone Review Pipeline
    @GetMapping("/tenure/reviews")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getTenureMilestones(@RequestParam(defaultValue = "FAC-01") String facultyId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "facultyId", facultyId,
                "currentStage", "ASSOCIATE_PROFESSOR_REVIEW",
                "milestones", List.of(
                        Map.of("year", 1, "status", "PASSED", "title", "Initial Faculty Onboarding Review"),
                        Map.of("year", 3, "status", "PASSED", "title", "Mid-Tenure Peer Publication Assessment"),
                        Map.of("year", 5, "status", "UNDER_REVIEW", "title", "Final University Committee Tenure Appraisal")
                )
        ));
    }
}
