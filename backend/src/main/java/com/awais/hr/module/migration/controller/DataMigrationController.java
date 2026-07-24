package com.awais.hr.module.migration.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.migration.service.DataMigrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/data-migration")
public class DataMigrationController {

    private final DataMigrationService migrationService;

    public DataMigrationController(DataMigrationService migrationService) {
        this.migrationService = migrationService;
    }

    @GetMapping("/jobs")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getMigrationJobs() {
        return ResponseEntity.ok(migrationService.getMigrationJobs());
    }

    @PostMapping("/execute")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> executeMigrationJob(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(migrationService.executeMigrationJob(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
