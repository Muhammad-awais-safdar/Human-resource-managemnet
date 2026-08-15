package com.awais.hr.module.verticals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/verticals/it-services", "/verticals/it-services"})
public class ItServicesModuleController {

    private final List<Map<String, Object>> devWorklogs = new ArrayList<>(List.of(
            Map.of(
                    "id", "LOG-8801",
                    "developerName", "Alex Rivera",
                    "jiraKey", "PROJ-402",
                    "commitHash", "a8f3b29c",
                    "hoursLogged", 7.5,
                    "billableStatus", "BILLABLE_CLIENT",
                    "logDate", LocalDate.now().toString()
            ),
            Map.of(
                    "id", "LOG-8802",
                    "developerName", "Elena Rostova",
                    "jiraKey", "FEAT-119",
                    "commitHash", "c72e911a",
                    "hoursLogged", 8.0,
                    "billableStatus", "BILLABLE_CLIENT",
                    "logDate", LocalDate.now().toString()
            )
    ));

    private final List<Map<String, Object>> equityGrants = new ArrayList<>(List.of(
            Map.of(
                    "id", "EQ-501",
                    "employeeName", "Alex Rivera",
                    "grantType", "ISO_STOCK_OPTIONS",
                    "optionCount", 25000,
                    "strikePrice", 1.25,
                    "vestingSchedule", "4-Year Standard (1-Year Cliff)",
                    "grantDate", LocalDate.now().minusYears(1).toString(),
                    "vestedCount", 6250
            )
    ));

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getItServicesMetrics() {
        return ResponseEntity.ok(Map.of(
                "billableDeveloperHoursToday", 142.5,
                "billableUtilizationPct", 91.8,
                "activeJiraIntegrations", 12,
                "totalVestedOptionsPool", 145000,
                "activeSprintVelocity", 84
        ));
    }

    @GetMapping("/dev-worklogs")
    public ResponseEntity<List<Map<String, Object>>> getDevWorklogs() {
        return ResponseEntity.ok(devWorklogs);
    }

    @GetMapping("/equity-grants")
    public ResponseEntity<List<Map<String, Object>>> getEquityGrants() {
        return ResponseEntity.ok(equityGrants);
    }

    @PostMapping("/equity-grants")
    public ResponseEntity<Map<String, Object>> addEquityGrant(@RequestBody Map<String, Object> payload) {
        String grantId = "EQ-" + (500 + equityGrants.size() + 1);
        Map<String, Object> entry = new HashMap<>(payload);
        entry.put("id", grantId);
        entry.put("grantDate", LocalDate.now().toString());
        entry.put("vestedCount", 0);
        equityGrants.add(0, entry);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Stock option equity grant created successfully",
                "entry", entry
        ));
    }
}
