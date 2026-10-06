package com.awais.hr.module.employee.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.employee.dto.ClearanceApprovalRequestDTO;
import com.awais.hr.module.employee.dto.TimelineEventRequestDTO;
import com.awais.hr.module.makerchecker.service.MakerCheckerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class EmployeeLifecycleServiceImpl implements EmployeeLifecycleService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeLifecycleServiceImpl.class);
    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;
    private final MakerCheckerService makerCheckerService;

    private static final Set<String> VALID_STATES = Set.of(
            "PROBATION", "ACTIVE", "SUSPENDED", "PROMOTED", "TRANSFERRED",
            "NOTICE_PERIOD", "TERMINATED", "RESIGNED", "RETIRED", "INVITED"
    );

    private static final Set<String> SENSITIVE_TRANSITIONS = Set.of(
            "SUSPENSION", "TERMINATION", "SALARY_REVISION", "ROLE_CHANGE", "DEPARTMENT_TRANSFER"
    );

    public EmployeeLifecycleServiceImpl(DataSource dataSource, PasswordEncoder passwordEncoder, MakerCheckerService makerCheckerService) {
        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
        this.makerCheckerService = makerCheckerService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTimeline() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT t.id, t.type, t.description, t.effective_date, e.first_name, e.last_name " +
                        "FROM employee_timeline t JOIN employee e ON t.employee_id = e.id ORDER BY t.created_at DESC"
        );
    }

    @Override
    @Auditable(action = "TIMELINE_EVENT_ADD", entity = "EmployeeTimeline")
    public void addTimelineEvent(TimelineEventRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String eventId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO employee_timeline (id, employee_id, type, description, effective_date) VALUES (?, ?, ?, ?, CAST(? AS DATE))",
                eventId, dto.getEmployeeId(), dto.getType(), dto.getDescription(), dto.getEffectiveDate()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExitClearances() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT c.id, c.department_approved, c.it_approved, c.finance_approved, c.status, e.first_name, e.last_name, e.email " +
                        "FROM exit_clearance c JOIN employee e ON c.employee_id = e.id"
        );
    }

    @Override
    @Auditable(action = "EXIT_CLEARANCE_APPROVE", entity = "ExitClearance")
    public void approveClearance(ClearanceApprovalRequestDTO dto) {
        if (dto == null || dto.getDepartment() == null || dto.getClearanceId() == null) {
            throw new IllegalArgumentException("Clearance ID and department must be specified.");
        }
        String deptStr = dto.getDepartment().toLowerCase().trim();
        String column;
        if ("department".equals(deptStr)) {
            column = "department_approved";
        } else if ("it".equals(deptStr)) {
            column = "it_approved";
        } else if ("finance".equals(deptStr)) {
            column = "finance_approved";
        } else {
            throw new IllegalArgumentException("Invalid clearance department specified: " + dto.getDepartment());
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE exit_clearance SET " + column + " = TRUE WHERE id = ?", dto.getClearanceId());

        Map<String, Object> c = jdbcTemplate.queryForMap("SELECT employee_id, department_approved, it_approved, finance_approved FROM exit_clearance WHERE id = ?", dto.getClearanceId());
        if (Boolean.TRUE.equals(c.get("department_approved")) && Boolean.TRUE.equals(c.get("it_approved")) && Boolean.TRUE.equals(c.get("finance_approved"))) {
            jdbcTemplate.update("UPDATE exit_clearance SET status = 'CLEARED' WHERE id = ?", dto.getClearanceId());
            String empId = (String) c.get("employee_id");

            // Finalize offboarding lifecycle state
            transitionEmployeeState(empId, "TERMINATED", "OFFBOARDING_COMPLETED", java.time.LocalDate.now().toString(), "Exit clearance completed across all departments.", "SYSTEM");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listEmployees() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbcTemplate.queryForList(
                "SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.status, e.org_unit_id, " +
                        "ou.name as db_department_name, " +
                        "r.id as role_id, r.name as role_name " +
                        "FROM employee e " +
                        "LEFT JOIN employee_role er ON e.id = er.employee_id " +
                        "LEFT JOIN role r ON er.role_id = r.id " +
                        "LEFT JOIN org_unit ou ON e.org_unit_id = ou.id"
        );
        for (Map<String, Object> emp : list) {
            String dbDeptName = (String) emp.get("db_department_name");
            String dept = dbDeptName;
            if (dept == null || dept.isBlank()) {
                String roleName = (String) emp.get("role_name");
                dept = "Engineering";
                if (roleName != null) {
                    String r = roleName.toUpperCase();
                    if (r.contains("HR")) dept = "Human Resources";
                    else if (r.contains("FINANCE") || r.contains("PAYROLL") || r.contains("AUDIT")) dept = "Finance";
                    else if (r.contains("TENANT_ADMIN") || r.contains("SYSTEM_ADMIN") || r.contains("EXECUTIVE")) dept = "Executive Board";
                    else if (r.contains("RECRUITER") || r.contains("TALENT")) dept = "Human Resources";
                    else if (r.contains("MARKETING") || r.contains("SALES")) dept = "Marketing";
                    else dept = "Engineering";
                }
            }
            emp.put("department", dept);
            emp.put("departmentName", dept);
        }
        return list;
    }

    @Override
    @Auditable(action = "EXIT_CLEARANCE_INITIATE", entity = "ExitClearance")
    public void initiateClearance(String employeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> active = jdbcTemplate.queryForList("SELECT id FROM exit_clearance WHERE employee_id = ?", employeeId);
        if (!active.isEmpty()) {
            throw new IllegalStateException("Exit clearance checklist already initiated for this employee.");
        }
        jdbcTemplate.update("INSERT INTO exit_clearance (id, employee_id) VALUES (?, ?)", UUID.randomUUID().toString(), employeeId);

        // Update employee lifecycle status to NOTICE_PERIOD
        transitionEmployeeState(employeeId, "NOTICE_PERIOD", "EXIT_CLEARANCE_INITIATED", java.time.LocalDate.now().toString(), "Initiated clearance workflow for employee offboarding.", "SYSTEM");
    }

    @Override
    @Auditable(action = "EMPLOYEE_INVITE", entity = "Employee")
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
                "INSERT INTO employee_invite (id, email, token, role_id, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 DAY))",
                inviteId, email, token, roleId
        );

        // Record initial ONBOARDING event
        jdbcTemplate.update(
                "INSERT INTO employee_lifecycle_event (id, employee_id, event_type, previous_state, new_state, effective_date, reason, initiated_by, status) " +
                        "VALUES (?, ?, 'ONBOARDING', 'NONE', 'INVITED', CURRENT_DATE, 'Employee invited to workspace platform', 'SYSTEM', 'COMPLETED')",
                UUID.randomUUID().toString(), employeeId
        );

        return token;
    }

    @Override
    @Auditable(action = "EMPLOYEE_ROLE_UPDATE", entity = "Employee")
    public void updateEmployeeRole(String employeeId, String roleId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        jdbcTemplate.update("DELETE FROM employee_role WHERE employee_id = ?", employeeId);

        if (roleId != null && !roleId.isBlank()) {
            jdbcTemplate.update(
                    "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?)",
                    employeeId, roleId
            );
        }

        // Track ROLE_CHANGE lifecycle transition
        transitionEmployeeState(employeeId, "ACTIVE", "ROLE_CHANGE", java.time.LocalDate.now().toString(), "Updated assigned security role.", "ADMIN");
    }

    @Override
    @Auditable(action = "EMPLOYEE_LIFECYCLE_TRANSITION", entity = "Employee")
    public void transitionEmployeeState(String employeeId, String newStatus, String eventType, String effectiveDate, String reason, String actorEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String targetStatus = newStatus.toUpperCase().trim();
        String type = eventType.toUpperCase().trim();

        if (!VALID_STATES.contains(targetStatus)) {
            throw new IllegalArgumentException("Invalid target lifecycle state: " + newStatus);
        }

        Map<String, Object> emp = jdbcTemplate.queryForMap("SELECT status FROM employee WHERE id = ?", employeeId);
        String currentStatus = (String) emp.get("status");

        // Prevent transitioning from TERMINATED to active states directly
        if ("TERMINATED".equals(currentStatus) && !"INVITED".equals(targetStatus) && !"PROBATION".equals(targetStatus)) {
            throw new IllegalStateException("Invalid state transition: Cannot directly re-activate a TERMINATED employee without re-hiring.");
        }

        // Record event in timeline
        jdbcTemplate.update(
                "INSERT INTO employee_timeline (id, employee_id, type, description, effective_date) VALUES (?, ?, ?, ?, CAST(? AS DATE))",
                UUID.randomUUID().toString(), employeeId, type, reason != null ? reason : "Lifecycle transition to " + targetStatus, effectiveDate
        );

        // Record lifecycle event detail
        jdbcTemplate.update(
                "INSERT INTO employee_lifecycle_event (id, employee_id, event_type, previous_state, new_state, effective_date, reason, initiated_by, status) " +
                        "VALUES (?, ?, ?, ?, ?, CAST(? AS DATE), ?, ?, 'COMPLETED')",
                UUID.randomUUID().toString(), employeeId, type, currentStatus, targetStatus, effectiveDate, reason, actorEmail
        );

        // Update employee status
        jdbcTemplate.update("UPDATE employee SET status = ? WHERE id = ?", targetStatus, employeeId);

        log.info("Employee lifecycle transitioned: id={} from={} to={} event={}", employeeId, currentStatus, targetStatus, type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLifecycleHistory(String employeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, event_type, previous_state, new_state, effective_date, reason, initiated_by, status, created_at " +
                        "FROM employee_lifecycle_event WHERE employee_id = ? ORDER BY effective_date DESC, created_at DESC",
                employeeId
        );
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

        List<Map<String, Object>> lifecycleEvents = getLifecycleHistory(employeeId);
        data360.put("lifecycleEvents", lifecycleEvents);

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
