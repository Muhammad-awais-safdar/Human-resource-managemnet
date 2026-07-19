package com.awais.hr.module.travel.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class TravelRequestServiceImpl implements TravelRequestService {

    private final DataSource dataSource;

    public TravelRequestServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    private boolean isSuperAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        return jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND r.name = 'SUPER_ADMIN')",
                Boolean.class, employeeId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTravelRequests(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT id, destination, purpose, start_date, end_date, status, approved_by FROM travel_request ORDER BY start_date DESC"
            );
        }
        return jdbcTemplate.queryForList(
                "SELECT id, destination, purpose, start_date, end_date, status, approved_by FROM travel_request WHERE employee_id = ? ORDER BY start_date DESC",
                empId
        );
    }

    @Override
    public void submitTravelRequest(String email, String destination, String purpose, String startDate, String endDate) {
        // Date range checks
        java.time.LocalDate start = java.time.LocalDate.parse(startDate);
        java.time.LocalDate end = java.time.LocalDate.parse(endDate);
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("Travel end date cannot be before start date.");
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        jdbcTemplate.update(
                "INSERT INTO travel_request (id, employee_id, destination, purpose, start_date, end_date, status) VALUES (?, ?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), 'PENDING')",
                UUID.randomUUID().toString(), empId, destination, purpose, startDate, endDate
        );
    }

    @Override
    public void approveTravelRequest(String id, String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        if (!isSuperAdmin(jdbcTemplate, empId)) {
            throw new SecurityException("Unauthorized: Only Admins can approve travel requests.");
        }

        Map<String, Object> req = jdbcTemplate.queryForMap("SELECT status FROM travel_request WHERE id = ?", id);
        if (!"PENDING".equalsIgnoreCase((String) req.get("status"))) {
            throw new IllegalStateException("Only PENDING travel requests can be approved.");
        }

        jdbcTemplate.update(
                "UPDATE travel_request SET status = 'APPROVED', approved_by = ? WHERE id = ?",
                empId, id
        );
    }

    @Override
    public void rejectTravelRequest(String id, String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        if (!isSuperAdmin(jdbcTemplate, empId)) {
            throw new SecurityException("Unauthorized: Only Admins can reject travel requests.");
        }

        Map<String, Object> req = jdbcTemplate.queryForMap("SELECT status FROM travel_request WHERE id = ?", id);
        if (!"PENDING".equalsIgnoreCase((String) req.get("status"))) {
            throw new IllegalStateException("Only PENDING travel requests can be rejected.");
        }

        jdbcTemplate.update(
                "UPDATE travel_request SET status = 'REJECTED', approved_by = ? WHERE id = ?",
                empId, id
        );
    }
}
