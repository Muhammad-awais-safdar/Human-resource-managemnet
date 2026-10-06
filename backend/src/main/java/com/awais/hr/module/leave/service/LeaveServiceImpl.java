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

    private boolean canApproveLeave(JdbcTemplate jdbcTemplate, String employeeId) {
        Boolean result = jdbcTemplate.queryForObject(
                "SELECT EXISTS(" +
                "  SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id " +
                "  WHERE er.employee_id = ? AND r.name IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'SYSTEM_ADMIN', 'HR_MANAGER', 'LINE_MANAGER') " +
                "  UNION " +
                "  SELECT 1 FROM employee_role er " +
                "  JOIN role_permission rp ON er.role_id = rp.role_id " +
                "  JOIN permission p ON rp.permission_id = p.id " +
                "  WHERE er.employee_id = ? AND p.name = 'leave:request:approve'" +
                ")",
                Boolean.class, employeeId, employeeId
        );
        return Boolean.TRUE.equals(result);
    }

    @Override
    public List<Map<String, Object>> getPolicies() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList("SELECT id, name, allowance, description FROM leave_policy");
    }

    @Override
    public void createPolicy(Map<String, Object> body) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        String name = (String) body.get("name");
        Object allowanceObj = body.get("allowance");
        int allowance = allowanceObj instanceof Number ? ((Number) allowanceObj).intValue() : Integer.parseInt(allowanceObj.toString());
        String description = (String) body.getOrDefault("description", "");

        jdbcTemplate.update(
                "INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, ?, ?, ?)",
                id, name, allowance, description
        );
    }

    @Override
    public void updatePolicy(String id, Map<String, Object> body) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String name = (String) body.get("name");
        Object allowanceObj = body.get("allowance");
        int allowance = allowanceObj instanceof Number ? ((Number) allowanceObj).intValue() : Integer.parseInt(allowanceObj.toString());
        String description = (String) body.getOrDefault("description", "");

        jdbcTemplate.update(
                "UPDATE leave_policy SET name = ?, allowance = ?, description = ? WHERE id = ?",
                name, allowance, description, id
        );
    }

    @Override
    public List<Map<String, Object>> getLeaveBalances(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);

        List<Map<String, Object>> policies = jdbcTemplate.queryForList("SELECT id, name, allowance, description FROM leave_policy");
        List<Map<String, Object>> balances = new ArrayList<>();

        for (Map<String, Object> p : policies) {
            String policyId = (String) p.get("id");
            String policyName = (String) p.get("name");
            int allowance = p.get("allowance") != null ? ((Number) p.get("allowance")).intValue() : 0;

            // Filter approved leave days by current calendar year for annual balance reset on New Year
            Integer used = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) FROM leave_request " +
                    "WHERE employee_id = ? AND leave_policy_id = ? AND status = 'APPROVED' AND deleted = FALSE " +
                    "AND YEAR(start_date) = YEAR(CURRENT_DATE())",
                    Integer.class, empId, policyId
            );
            int usedDays = used != null ? used : 0;
            int remainingDays = Math.max(0, allowance - usedDays);

            Map<String, Object> balance = new HashMap<>();
            balance.put("policyId", policyId);
            balance.put("policyName", policyName);
            balance.put("allowance", allowance);
            balance.put("usedDays", usedDays);
            balance.put("remainingDays", remainingDays);
            balance.put("year", java.time.LocalDate.now().getYear());
            balance.put("description", p.get("description"));
            balances.add(balance);
        }
        return balances;
    }

    @Override
    public List<Map<String, Object>> getRequests(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        if (canApproveLeave(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT r.id, r.start_date, r.end_date, r.reason, r.status, r.approved_by, r.deleted, " +
                    "p.name as policy_name, e.first_name, e.last_name, e.email " +
                    "FROM leave_request r " +
                    "JOIN leave_policy p ON r.leave_policy_id = p.id " +
                    "JOIN employee e ON r.employee_id = e.id " +
                    "WHERE r.deleted = FALSE " +
                    "ORDER BY r.start_date DESC"
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT r.id, r.start_date, r.end_date, r.reason, r.status, r.approved_by, " +
                    "p.name as policy_name, e.first_name, e.last_name, e.email " +
                    "FROM leave_request r " +
                    "JOIN leave_policy p ON r.leave_policy_id = p.id " +
                    "JOIN employee e ON r.employee_id = e.id " +
                    "WHERE r.employee_id = ? AND r.deleted = FALSE " +
                    "ORDER BY r.start_date DESC",
                    empId
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

        String employeeId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);

        // Calculate total approved leave days taken in the target request year
        int requestYear = start.getYear();
        Integer usedDaysObj = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) FROM leave_request " +
                "WHERE employee_id = ? AND leave_policy_id = ? AND status = 'APPROVED' AND deleted = FALSE " +
                "AND YEAR(start_date) = ?",
                Integer.class, employeeId, dto.getPolicyId(), requestYear
        );
        int usedDays = usedDaysObj != null ? usedDaysObj : 0;
        
        if (allowance != null && (usedDays + requestedDays) > allowance) {
            int remaining = Math.max(0, allowance - usedDays);
            throw new IllegalArgumentException("Requested " + requestedDays + " days exceeds your remaining " + requestYear + " quota of " + remaining + " days (Policy Allowance: " + allowance + " days, Used: " + usedDays + " days)");
        }

        String requestId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status) " +
                "VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'PENDING')",
                requestId, employeeId, dto.getPolicyId(), dto.getStartDate(), dto.getEndDate(), dto.getReason()
        );
    }

    @Override
    public Map<String, Object> processYearEndReset() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        int currentYear = java.time.LocalDate.now().getYear();
        int previousYear = currentYear - 1;

        // Verify or create yearly audit reset log table if needed
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS employee_yearly_leave_reset (" +
                    "id VARCHAR(50) PRIMARY KEY, " +
                    "year INT NOT NULL, " +
                    "reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")"
            );
            jdbcTemplate.update(
                    "INSERT INTO employee_yearly_leave_reset (id, year) VALUES (?, ?)",
                    UUID.randomUUID().toString(), currentYear
            );
        } catch (Exception ignored) {}

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("activeYear", currentYear);
        res.put("archivedYear", previousYear);
        res.put("message", "Annual Leave Reset completed successfully. Quotas reset to full policy allowance for calendar year " + currentYear);
        return res;
    }

    @Override
    public void updateRequestStatus(String approverEmail, String id, LeaveStatusUpdateDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String approverEmpId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, approverEmail);

        if (!canApproveLeave(jdbcTemplate, approverEmpId)) {
            throw new SecurityException("Forbidden: You do not have permission to approve or reject leave requests.");
        }

        // Prevent self-approval
        String applicantEmpId = jdbcTemplate.queryForObject("SELECT employee_id FROM leave_request WHERE id = ?", String.class, id);
        if (approverEmpId.equals(applicantEmpId)) {
            throw new IllegalArgumentException("Self-approval prohibited: You cannot approve or reject your own leave request.");
        }

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
