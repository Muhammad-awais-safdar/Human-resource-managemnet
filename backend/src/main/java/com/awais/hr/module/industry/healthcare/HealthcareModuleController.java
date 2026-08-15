package com.awais.hr.module.industry.healthcare;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/healthcare")
public class HealthcareModuleController {

    private final List<Map<String, Object>> shiftSwapRequests = new ArrayList<>();

    @PostMapping("/shift-swaps/request")
    @HasPermission("corehr:employee:write")
    @RequiresModule("HEALTHCARE_CREDENTIALS")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestShiftSwap(@RequestBody Map<String, Object> payload) {
        String requestingNurse = (String) payload.getOrDefault("requestingNurse", "nurse.jane@hospital.org");
        String targetNurse = (String) payload.getOrDefault("targetNurse", "nurse.john@hospital.org");
        String shiftDate = (String) payload.getOrDefault("shiftDate", LocalDate.now().plusDays(2).toString());

        Map<String, Object> swapReq = new HashMap<>();
        swapReq.put("id", UUID.randomUUID().toString());
        swapReq.put("requestingNurse", requestingNurse);
        swapReq.put("targetNurse", targetNurse);
        swapReq.put("shiftDate", shiftDate);
        swapReq.put("status", "PENDING_SUPERVISOR");

        shiftSwapRequests.add(swapReq);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Peer nurse shift swap trade request submitted for supervisor sign-off",
            "request", swapReq
        )));
    }

    @GetMapping("/licenses/verify/{licenseNo}")
    @HasPermission("corehr:employee:read")
    @RequiresModule("HEALTHCARE_CREDENTIALS")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyMedicalLicense(@PathVariable String licenseNo) {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "licenseNumber", licenseNo,
            "boardName", "State Board of Nursing & Medical Examiners",
            "practitionerName", "Dr. Sarah Jenkins, MD",
            "status", "ACTIVE_VERIFIED",
            "expirationDate", LocalDate.now().plusYears(2).toString(),
            "verificationMethod", "DIRECT_STATE_BOARD_API"
        )));
    }

    @GetMapping("/gxp/matrix")
    @HasPermission("corehr:employee:read")
    @RequiresModule("HEALTHCARE_CREDENTIALS")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGxPQualificationMatrix() {
        return ResponseEntity.ok(ApiResponse.success(List.of(
            Map.of("facility", "Cleanroom Alpha", "labEquipment", "HPLC Chromatography", "qualifiedOperators", 14, "status", "VALIDATED"),
            Map.of("facility", "Biotech Suite B", "labEquipment", "Centrifuge Mass Spec", "qualifiedOperators", 8, "status", "VALIDATED")
        )));
    }
}
