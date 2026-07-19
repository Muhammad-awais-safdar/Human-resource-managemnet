package com.awais.hr.module.leave.service;

import com.awais.hr.module.leave.dto.LeaveRequestDTO;
import com.awais.hr.module.leave.dto.LeaveStatusUpdateDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final DataSource dataSource;

    public LeaveServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private boolean isSuperAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        return jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND r.name = 'SUPER_ADMIN')",
                Boolean.class, employeeId
        );
    }

    @Override
    public List<Map<String, Object>> getPolicies() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList("SELECT id, name, allowance, description FROM leave_policy");
    }

    @Override
    public List<Map<String, Object>> getRequests(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT r.id, r.start_date, r.end_date, r.reason, r.status, r.approved_by, r.deleted, " +
                    "p.name as policy_name, e.first_name, e.last_name, e.email " +
                    "FROM leave_request r " +
                    "JOIN leave_policy p ON r.leave_policy_id = p.id " +
                    "JOIN employee e ON r.employee_id = e.id " +
                    "ORDER BY r.start_date DESC"
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT r.id, r.start_date, r.end_date, r.reason, r.status, r.approved_by, " +
                    "p.name as policy_name, e.first_name, e.last_name, e.email " +
                    "FROM leave_request r " +
                    "JOIN leave_policy p ON r.leave_policy_id = p.id " +
                    "JOIN employee e ON r.employee_id = e.id " +
                    "WHERE r.deleted = FALSE " +
                    "ORDER BY r.start_date DESC"
            );
        }
    }

    @Override
    public void submitRequest(String email, LeaveRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        java.time.LocalDate start = java.time.LocalDate.parse(dto.getStartDate());
        java.time.LocalDate end = java.time.LocalDate.parse(dto.getEndDate());
        long requestedDays = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        
        if (requestedDays <= 0) {
            throw new IllegalArgumentException("Invalid date range: start date must be before or equal to end date");
        }

        Integer allowance = jdbcTemplate.queryForObject(
                "SELECT allowance FROM leave_policy WHERE id = ?",
                Integer.class,
                dto.getPolicyId()
        );
        
        if (allowance != null && requestedDays > allowance) {
            throw new IllegalArgumentException("Vacation request of " + requestedDays + " days exceeds available policy limit of " + allowance + " days");
        }

        String employeeId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        String requestId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status) " +
                "VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'PENDING')",
                requestId, employeeId, dto.getPolicyId(), dto.getStartDate(), dto.getEndDate(), dto.getReason()
        );
    }

    @Override
    public void updateRequestStatus(String approverEmail, String id, LeaveStatusUpdateDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update(
                "UPDATE leave_request SET status = ?, approved_by = ? WHERE id = ?",
                dto.getStatus(), approverEmail, id
        );
    }

    @Override
    public void deleteRequest(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE leave_request SET deleted = TRUE WHERE id = ?", id);
    }
}
