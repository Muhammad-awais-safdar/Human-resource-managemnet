package com.awais.hr.module.report.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.report.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getDefinitions() {
        return ResponseEntity.ok(reportService.getReportDefinitions());
    }

    @PostMapping
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createDefinition(@AuthenticationPrincipal UserDetails user,
                                               @RequestBody Map<String, String> body) {
        try {
            reportService.createReportDefinition(
                    getUsername(user),
                    body.get("name"),
                    body.get("description"),
                    body.get("queryTemplate"),
                    body.get("parametersJson"),
                    body.get("format"),
                    body.get("module")
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Report definition created."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/run")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> runReport(@PathVariable String id,
                                        @RequestBody(required = false) Map<String, Object> parameters) {
        try {
            List<Map<String, Object>> results = reportService.runReport(id, parameters != null ? parameters : Map.of());
            return ResponseEntity.ok(Map.of("success", true, "count", results.size(), "data", results));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/export/csv")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<byte[]> exportCsv(@PathVariable String id,
                                             @RequestBody(required = false) Map<String, Object> parameters) {
        String csv = reportService.exportReportCsv(id, parameters != null ? parameters : Map.of());
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + id + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/dashboard/metrics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reportService.getDashboardMetrics(getUsername(user)));
    }

    private String getUsername(UserDetails user) {
        return user != null ? user.getUsername() : "system@company.com";
    }
}
