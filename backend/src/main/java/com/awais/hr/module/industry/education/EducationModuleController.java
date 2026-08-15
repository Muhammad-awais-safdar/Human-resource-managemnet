package com.awais.hr.module.industry.education;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/education")
public class EducationModuleController {

    @PostMapping("/faculty/lecture-credits")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateFacultyOverload(@RequestBody Map<String, Object> payload) {
        String professorEmail = (String) payload.getOrDefault("professorEmail", "prof.smith@university.edu");
        Integer baseCreditHours = Integer.parseInt(payload.getOrDefault("baseCreditHours", 12).toString());
        Integer totalTeachingHours = Integer.parseInt(payload.getOrDefault("totalTeachingHours", 18).toString());
        Double overloadRate = Double.parseDouble(payload.getOrDefault("overloadRate", 150.00).toString());

        int overloadHours = Math.max(0, totalTeachingHours - baseCreditHours);
        double overloadPay = overloadHours * overloadRate;

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "professorEmail", professorEmail,
            "baseCreditHours", baseCreditHours,
            "totalTeachingHours", totalTeachingHours,
            "overloadHours", overloadHours,
            "overloadPay", overloadPay,
            "term", "Spring 2026"
        )));
    }

    @GetMapping("/tenure-pipeline")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTenureReviewPipeline() {
        return ResponseEntity.ok(ApiResponse.success(List.of(
            Map.of("candidate", "Dr. Alan Turing", "department", "Computer Science", "stage", "PEER_COMMITTEE_REVIEW", "yearsInTrack", 5),
            Map.of("candidate", "Dr. Ada Lovelace", "department", "Mathematics", "stage", "DEAN_FINAL_SIGN_OFF", "yearsInTrack", 6)
        )));
    }
}
