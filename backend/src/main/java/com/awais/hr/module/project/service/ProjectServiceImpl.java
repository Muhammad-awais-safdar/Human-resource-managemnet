package com.awais.hr.module.project.service;

import com.awais.hr.module.project.dto.TimesheetLogRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final DataSource dataSource;

    public ProjectServiceImpl(DataSource dataSource) {
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
    public List<Map<String, Object>> getProjects() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList("SELECT id, name, description FROM project ORDER BY name");
    }

    @Override
    public void submitTimesheet(String email, TimesheetLogRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        // Validation 1: Hours worked must be positive and not exceed 24 hours in a day
        if (dto.getHours() == null || dto.getHours().doubleValue() <= 0 || dto.getHours().doubleValue() > 24) {
            throw new IllegalArgumentException("Hours worked must be greater than 0 and cannot exceed 24.");
        }

        // Validation 2: Check total hours logged by the employee for the given work_date
        Double totalLogged = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(hours_worked), 0) FROM timesheet_log WHERE employee_id = ? AND work_date = CAST(? AS DATE)",
                Double.class, empId, dto.getDate()
        );
        if (totalLogged + dto.getHours().doubleValue() > 24) {
            throw new IllegalArgumentException("Logging these hours would exceed the 24-hour limit for this day.");
        }

        // Validation 3: Check for exact date/project log overlap
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM timesheet_log WHERE employee_id = ? AND project_id = ? AND work_date = CAST(? AS DATE))",
                Boolean.class, empId, dto.getProjectId(), dto.getDate()
        );
        if (exists != null && exists) {
            throw new IllegalArgumentException("A timesheet entry already exists for this project on this date.");
        }

        jdbcTemplate.update("INSERT INTO timesheet_log (id, employee_id, project_id, work_date, hours_worked, status) VALUES (?, ?, ?, CAST(? AS DATE), ?, 'PENDING')",
                UUID.randomUUID().toString(), empId, dto.getProjectId(), dto.getDate(), dto.getHours());
    }

    @Override
    public void allocateResource(String projectId, String employeeId, String role) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        // Ensure not already allocated
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM project_allocation WHERE project_id = ? AND employee_id = ?)",
                Boolean.class, projectId, employeeId
        );
        if (exists != null && exists) {
            throw new IllegalArgumentException("Resource is already allocated to this project.");
        }

        jdbcTemplate.update(
                "INSERT INTO project_allocation (id, project_id, employee_id, role) VALUES (?, ?, ?, ?)",
                UUID.randomUUID().toString(), projectId, employeeId, role
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTimesheets(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT tl.id, tl.work_date, tl.hours_worked, tl.status, p.name as project_name, e.first_name, e.last_name " +
                    "FROM timesheet_log tl " +
                    "JOIN project p ON tl.project_id = p.id " +
                    "JOIN employee e ON tl.employee_id = e.id " +
                    "ORDER BY tl.work_date DESC"
            );
        }

        return jdbcTemplate.queryForList(
                "SELECT tl.id, tl.work_date, tl.hours_worked, tl.status, p.name as project_name " +
                "FROM timesheet_log tl " +
                "JOIN project p ON tl.project_id = p.id " +
                "WHERE tl.employee_id = ? " +
                "ORDER BY tl.work_date DESC",
                empId
        );
    }

    @Override
    public void approveTimesheet(String timesheetId, String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        if (!isSuperAdmin(jdbcTemplate, empId)) {
            throw new SecurityException("Unauthorized: Only Admins can approve timesheets.");
        }

        Map<String, Object> logEntry = jdbcTemplate.queryForMap("SELECT status FROM timesheet_log WHERE id = ?", timesheetId);
        if (!"PENDING".equalsIgnoreCase((String) logEntry.get("status"))) {
            throw new IllegalStateException("Only PENDING timesheets can be approved.");
        }

        jdbcTemplate.update("UPDATE timesheet_log SET status = 'APPROVED' WHERE id = ?", timesheetId);
    }

    @Override
    public void rejectTimesheet(String timesheetId, String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        if (!isSuperAdmin(jdbcTemplate, empId)) {
            throw new SecurityException("Unauthorized: Only Admins can reject timesheets.");
        }

        Map<String, Object> logEntry = jdbcTemplate.queryForMap("SELECT status FROM timesheet_log WHERE id = ?", timesheetId);
        if (!"PENDING".equalsIgnoreCase((String) logEntry.get("status"))) {
            throw new IllegalStateException("Only PENDING timesheets can be rejected.");
        }

        jdbcTemplate.update("UPDATE timesheet_log SET status = 'REJECTED' WHERE id = ?", timesheetId);
    }
}
