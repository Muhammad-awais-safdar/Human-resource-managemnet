package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/manufacturing/machinery")
@CrossOrigin(origins = "*")
public class MachineryMaintenanceController {

    private final DataSource dataSource;

    public MachineryMaintenanceController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostMapping("/schedule")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> scheduleMaintenance(@RequestBody Map<String, String> body) {
        String machineCode = body.getOrDefault("machineCode", "CNC-ROUTER-01");
        String machineName = body.getOrDefault("machineName", "Precision 5-Axis CNC Router");
        String maintenanceType = body.getOrDefault("maintenanceType", "PREVENTIVE_CALIBRATION");
        String operatorId = body.getOrDefault("responsibleOperatorId", "EMP-MFG-01");

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String taskId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO machinery_maintenance_task (id, machine_code, machine_name, maintenance_type, responsible_operator_id, due_date, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')",
                taskId, machineCode, machineName, maintenanceType, operatorId, Date.valueOf(LocalDate.now().plusDays(7))
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "taskId", taskId,
                "machineCode", machineCode,
                "machineName", machineName,
                "dueDate", LocalDate.now().plusDays(7).toString()
        ));
    }

    @GetMapping("/tasks")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getMaintenanceTasks() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> tasks = jdbcTemplate.queryForList(
                "SELECT id, machine_code, machine_name, maintenance_type, responsible_operator_id, due_date, status " +
                "FROM machinery_maintenance_task ORDER BY due_date ASC"
        );
        return ResponseEntity.ok(Map.of("success", true, "tasks", tasks));
    }
}
