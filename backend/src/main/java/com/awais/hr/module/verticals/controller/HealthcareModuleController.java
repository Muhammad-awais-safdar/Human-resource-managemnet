package com.awais.hr.module.verticals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/verticals/healthcare", "/verticals/healthcare"})
public class HealthcareModuleController {

    private final List<Map<String, Object>> shiftRosters = new ArrayList<>(List.of(
            Map.of(
                    "id", "SHIFT-2001",
                    "unit", "ICU Intensive Care Ward",
                    "shiftType", "NIGHT_ROTATION_12H",
                    "assignedNurse", "Sarah Connor, RN",
                    "licenseNumber", "RN-NY-884920",
                    "shiftDate", LocalDate.now().toString(),
                    "status", "ACTIVE_ON_DUTY"
            ),
            Map.of(
                    "id", "SHIFT-2002",
                    "unit", "Emergency Department (ED)",
                    "shiftType", "DAY_SHIFTS_8H",
                    "assignedNurse", "Dr. Marcus Vance, MD",
                    "licenseNumber", "MD-NY-110293",
                    "shiftDate", LocalDate.now().toString(),
                    "status", "ACTIVE_ON_DUTY"
            )
    ));

    private final List<Map<String, Object>> clinicalLicenses = new ArrayList<>(List.of(
            Map.of(
                    "id", "LIC-401",
                    "employeeName", "Sarah Connor, RN",
                    "certificationType", "Registered Nurse (RN) & ACLS",
                    "issuingAuthority", "New York Board of Nursing",
                    "licenseNumber", "RN-NY-884920",
                    "expirationDate", LocalDate.now().plusMonths(8).toString(),
                    "verificationStatus", "VERIFIED_VALID"
            ),
            Map.of(
                    "id", "LIC-402",
                    "employeeName", "David Miller, LPN",
                    "certificationType", "Licensed Practical Nurse",
                    "issuingAuthority", "New York Board of Nursing",
                    "licenseNumber", "LPN-NY-552019",
                    "expirationDate", LocalDate.now().plusDays(15).toString(),
                    "verificationStatus", "RENEWAL_URGENT"
            )
    ));

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getHealthcareMetrics() {
        return ResponseEntity.ok(Map.of(
                "activeWardShiftsCount", 34,
                "nurseToPatientRatio", "1 : 4 (Compliant)",
                "verifiedLicensesCount", clinicalLicenses.size(),
                "urgentRenewalAlerts", 1,
                "clinicalCompliancePct", 98.2
        ));
    }

    @GetMapping("/shift-rosters")
    public ResponseEntity<List<Map<String, Object>>> getShiftRosters() {
        return ResponseEntity.ok(shiftRosters);
    }

    @GetMapping("/credentials")
    public ResponseEntity<List<Map<String, Object>>> getClinicalLicenses() {
        return ResponseEntity.ok(clinicalLicenses);
    }

    @PostMapping("/credentials")
    public ResponseEntity<Map<String, Object>> addClinicalLicense(@RequestBody Map<String, Object> payload) {
        String licId = "LIC-" + (400 + clinicalLicenses.size() + 1);
        Map<String, Object> entry = new HashMap<>(payload);
        entry.put("id", licId);
        entry.put("verificationStatus", "VERIFIED_VALID");
        clinicalLicenses.add(0, entry);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Clinical medical license recorded and verified successfully",
                "entry", entry
        ));
    }
}
