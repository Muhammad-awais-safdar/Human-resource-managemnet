package com.awais.hr.module.employee.service;

import com.awais.hr.module.employee.dto.ClearanceApprovalRequestDTO;
import com.awais.hr.module.employee.dto.TimelineEventRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class EmployeeLifecycleServiceImpl implements EmployeeLifecycleService {

    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;

    public EmployeeLifecycleServiceImpl(DataSource dataSource, PasswordEncoder passwordEncoder) {
        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<Map<String, Object>> getTimeline() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT t.id, t.type, t.description, t.effective_date, e.first_name, e.last_name " +
                "FROM employee_timeline t JOIN employee e ON t.employee_id = e.id ORDER BY t.created_at DESC"
        );
    }

    @Override
    public void addTimelineEvent(TimelineEventRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String eventId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO employee_timeline (id, employee_id, type, description, effective_date) VALUES (?, ?, ?, ?, CAST(? AS DATE))",
                eventId, dto.getEmployeeId(), dto.getType(), dto.getDescription(), dto.getEffectiveDate()
        );
    }

    @Override
    public List<Map<String, Object>> getExitClearances() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT c.id, c.department_approved, c.it_approved, c.finance_approved, c.status, e.first_name, e.last_name, e.email " +
                "FROM exit_clearance c JOIN employee e ON c.employee_id = e.id"
        );
    }

    @Override
    public void approveClearance(ClearanceApprovalRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String column = dto.getDepartment().toLowerCase() + "_approved";
        jdbcTemplate.update("UPDATE exit_clearance SET " + column + " = TRUE WHERE id = ?", dto.getClearanceId());
        
        Map<String, Object> c = jdbcTemplate.queryForMap("SELECT department_approved, it_approved, finance_approved FROM exit_clearance WHERE id = ?", dto.getClearanceId());
        if ((Boolean) c.get("department_approved") && (Boolean) c.get("it_approved") && (Boolean) c.get("finance_approved")) {
            jdbcTemplate.update("UPDATE exit_clearance SET status = 'CLEARED' WHERE id = ?", dto.getClearanceId());
        }
    }

    @Override
    public List<Map<String, Object>> listEmployees() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.status, " +
                "r.id as role_id, r.name as role_name " +
                "FROM employee e " +
                "LEFT JOIN employee_role er ON e.id = er.employee_id " +
                "LEFT JOIN role r ON er.role_id = r.id"
        );
    }

    @Override
    public void initiateClearance(String employeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> active = jdbcTemplate.queryForList("SELECT id FROM exit_clearance WHERE employee_id = ?", employeeId);
        if (!active.isEmpty()) {
            throw new IllegalStateException("Exit clearance checklist already initiated for this employee.");
        }
        jdbcTemplate.update("INSERT INTO exit_clearance (id, employee_id) VALUES (?, ?)", UUID.randomUUID().toString(), employeeId);
    }

    @Override
    public String inviteEmployee(String employeeCode, String firstName, String lastName, String email, String roleId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM employee WHERE email = ? OR employee_code = ?",
                Integer.class, email, employeeCode
        );
        if (count != null && count > 0) {
            throw new IllegalArgumentException("Employee with this email or code already exists.");
        }
        
        String employeeId = UUID.randomUUID().toString();
        String randomHashedPassword = passwordEncoder.encode(UUID.randomUUID().toString());
        
        jdbcTemplate.update(
                "INSERT INTO employee (id, employee_code, first_name, last_name, email, password, status, joining_date) VALUES (?, ?, ?, ?, ?, ?, 'INVITED', CURRENT_DATE)",
                employeeId, employeeCode, firstName, lastName, email, randomHashedPassword
        );
        
        if (roleId != null && !roleId.isBlank()) {
            jdbcTemplate.update(
                    "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?)",
                    employeeId, roleId
            );
        }

        String token = UUID.randomUUID().toString();
        String inviteId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO employee_invite (id, email, token, role_id, expires_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP + INTERVAL '2 days')",
                inviteId, email, token, roleId
        );

        return token;
    }

    @Override
    public void updateEmployeeRole(String employeeId, String roleId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        jdbcTemplate.update("DELETE FROM employee_role WHERE employee_id = ?", employeeId);
        
        if (roleId != null && !roleId.isBlank()) {
            jdbcTemplate.update(
                    "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?)",
                    employeeId, roleId
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getEmployee360(String employeeId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        
        Map<String, Object> personal;
        try {
            personal = jdbc.queryForMap(
                    "SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.status, e.joining_date, e.custom_metadata, " +
                    "r.name as role_name " +
                    "FROM employee e " +
                    "LEFT JOIN employee_role er ON e.id = er.employee_id " +
                    "LEFT JOIN role r ON er.role_id = r.id " +
                    "WHERE e.id = ?",
                    employeeId
            );
        } catch (Exception e) {
            throw new IllegalArgumentException("Employee not found with ID: " + employeeId);
        }

        Map<String, Object> data360 = new HashMap<>(personal);

        List<Map<String, Object>> timeline = jdbc.queryForList(
                "SELECT id, type, description, effective_date, created_at " +
                "FROM employee_timeline WHERE employee_id = ? ORDER BY effective_date DESC",
                employeeId
        );
        data360.put("timeline", timeline);

        List<Map<String, Object>> assets = jdbc.queryForList(
                "SELECT id, asset_name, asset_code, allocated_at, returned_at " +
                "FROM asset_allocation WHERE employee_id = ? ORDER BY allocated_at DESC",
                employeeId
        );
        data360.put("assets", assets);

        List<Map<String, Object>> leaves = jdbc.queryForList(
                "SELECT lr.id, lp.name as policy_name, lr.start_date, lr.end_date, lr.reason, lr.status " +
                "FROM leave_request lr " +
                "LEFT JOIN leave_policy lp ON lr.leave_policy_id = lp.id " +
                "WHERE lr.employee_id = ? ORDER BY lr.start_date DESC",
                employeeId
        );
        data360.put("leaves", leaves);

        List<Map<String, Object>> payroll = jdbc.queryForList(
                "SELECT id, pay_period, net_salary, status " +
                "FROM payslip WHERE employee_id = ? ORDER BY pay_period DESC",
                employeeId
        );
        data360.put("payroll", payroll);

        List<Map<String, Object>> feedback = jdbc.queryForList(
                "SELECT id, rating, feedback, created_at " +
                "FROM peer_feedback WHERE employee_id = ? ORDER BY created_at DESC",
                employeeId
        );
        data360.put("feedback", feedback);

        List<Map<String, Object>> goals = jdbc.queryForList(
                "SELECT id, title, target_value, current_value, status " +
                "FROM performance_goal WHERE employee_id = ? ORDER BY title ASC",
                employeeId
        );
        data360.put("goals", goals);

        return data360;
    }
}


