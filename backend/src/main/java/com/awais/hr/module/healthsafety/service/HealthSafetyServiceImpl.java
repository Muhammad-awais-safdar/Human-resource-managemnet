package com.awais.hr.module.healthsafety.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class HealthSafetyServiceImpl implements HealthSafetyService {

    private static final Logger log = LoggerFactory.getLogger(HealthSafetyServiceImpl.class);
    private final DataSource dataSource;

    public HealthSafetyServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getIncidents() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, title, incident_date, severity, location, description, reporter_employee_id, status, created_at " +
                "FROM safety_incident ORDER BY incident_date DESC"
        );
    }

    @Override
    public Map<String, Object> reportIncident(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Incident title is required.");
        }
        String severity = body.get("severity") != null ? (String) body.get("severity") : "MEDIUM";
        String location = (String) body.get("location");
        String description = (String) body.get("description");
        String reporterId = (String) body.get("reporterEmployeeId");
        String status = body.get("status") != null ? (String) body.get("status") : "OPEN";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO safety_incident (id, title, severity, location, description, reporter_employee_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, title.trim(), severity, location, description, reporterId, status
        );
        log.info("Safety incident reported: id={} title={}", id, title);
        return Map.of("id", id, "title", title, "severity", severity, "status", status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPpeAssignments() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, item_name, employee_id, assigned_date, expiry_date, status, created_at " +
                "FROM ppe_assignment ORDER BY assigned_date DESC"
        );
    }

    @Override
    public Map<String, Object> assignPpe(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String itemName = (String) body.get("itemName");
        if (itemName == null || itemName.isBlank()) {
            throw new IllegalArgumentException("PPE item name is required.");
        }
        String employeeId = (String) body.get("employeeId");
        if (employeeId == null || employeeId.isBlank()) {
            throw new IllegalArgumentException("Employee ID is required.");
        }

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO ppe_assignment (id, item_name, employee_id) VALUES (?, ?, ?)",
                id, itemName.trim(), employeeId
        );
        log.info("PPE assigned: id={} item={} employeeId={}", id, itemName, employeeId);
        return Map.of("id", id, "itemName", itemName, "employeeId", employeeId);
    }
}
