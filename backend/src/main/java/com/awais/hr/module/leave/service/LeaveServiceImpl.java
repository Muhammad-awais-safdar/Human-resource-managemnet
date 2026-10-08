package com.awais.hr.module.leave.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.leave.dto.LeaveRequestDTO;
import com.awais.hr.module.leave.dto.LeaveStatusUpdateDTO;
import com.awais.hr.module.workflow.engine.WorkflowEngineService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveServiceImpl.class);
    private final DataSource dataSource;
    private final WorkflowEngineService workflowEngineService;

    public LeaveServiceImpl(DataSource dataSource, WorkflowEngineService workflowEngineService) {
        this.dataSource = dataSource;
        this.workflowEngineService = workflowEngineService;
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
                        "  WHERE er.employee_id = ? AND p.name IN ('leave:request:approve', 'leave:approve')" +
                        ")",
                Boolean.class, employeeId, employeeId
        );
        return Boolean.TRUE.equals(result);
    }

    private void ensureLeaveBalanceRecord(JdbcTemplate jdbc, String employeeId, String policyId, int year) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM employee_leave_balance WHERE employee_id = ? AND leave_policy_id = ? AND year = ?",
                Integer.class, employeeId, policyId, year
        );

        if (count == null || count == 0) {
            Integer allowance = jdbc.queryForObject(
                    "SELECT allowance FROM leave_policy WHERE id = ?", Integer.class, policyId
            );
            int initAllowance = allowance != null ? allowance : 0;
            String balanceId = UUID.randomUUID().toString();

            jdbc.update(
                    "INSERT INTO employee_leave_balance (id, employee_id, leave_policy_id, year, allocated_days, remaining_days) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                    balanceId, employeeId, policyId, year, initAllowance, initAllowance
            );

            // Log initial accrual transaction
            jdbc.update(
                    "INSERT INTO leave_balance_ledger (id, employee_id, leave_policy_id, transaction_type, days, reason, performed_by) " +
                            "VALUES (?, ?, ?, 'ACCRUAL', ?, 'Initial annual policy allocation', 'SYSTEM')",
                    UUID.randomUUID().toString(), employeeId, policyId, initAllowance
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPolicies() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList("SELECT id, name, allowance, description FROM leave_policy");
    }

    @Override
    @Auditable(action = "LEAVE_POLICY_CREATE", entity = "LeavePolicy")
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
    @Auditable(action = "LEAVE_POLICY_UPDATE", entity = "LeavePolicy")
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
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLeaveBalances(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        int currentYear = LocalDate.now().getYear();

        List<Map<String, Object>> policies = jdbcTemplate.queryForList("SELECT id, name, allowance, description FROM leave_policy");
        List<Map<String, Object>> balances = new ArrayList<>();

        for (Map<String, Object> p : policies) {
            String policyId = (String) p.get("id");
            ensureLeaveBalanceRecord(jdbcTemplate, empId, policyId, currentYear);

            Map<String, Object> balRow = jdbcTemplate.queryForMap(
                    "SELECT allocated_days, used_days, pending_days, remaining_days FROM employee_leave_balance " +
                            "WHERE employee_id = ? AND leave_policy_id = ? AND year = ?",
                    empId, policyId, currentYear
            );

            Map<String, Object> balance = new HashMap<>();
            balance.put("policyId", policyId);
            balance.put("policyName", p.get("name"));
            balance.put("allowance", balRow.get("allocated_days"));
            balance.put("usedDays", balRow.get("used_days"));
            balance.put("pendingDays", balRow.get("pending_days"));
            balance.put("remainingDays", balRow.get("remaining_days"));
            balance.put("year", currentYear);
            balance.put("description", p.get("description"));
            balances.add(balance);
        }
        return balances;
    }

    @Override
    @Transactional(readOnly = true)
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
    @Auditable(action = "LEAVE_SUBMISSION", entity = "LeaveRequest")
    public void submitRequest(String email, LeaveRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        LocalDate start = LocalDate.parse(dto.getStartDate());
        LocalDate end = LocalDate.parse(dto.getEndDate());
        long requestedDays = ChronoUnit.DAYS.between(start, end) + 1;

        if (requestedDays <= 0) {
            throw new IllegalArgumentException("Invalid date range: start date must be before or equal to end date");
        }

        String employeeId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        int requestYear = start.getYear();

        // 1. Double-Booking Overlap Prevention Check
        Integer overlapCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM leave_request " +
                        "WHERE employee_id = ? AND deleted = FALSE AND status IN ('PENDING', 'SUBMITTED', 'APPROVED') " +
                        "AND (start_date <= ? AND end_date >= ?)",
                Integer.class, employeeId, dto.getEndDate(), dto.getStartDate()
        );

        if (overlapCount != null && overlapCount > 0) {
            throw new IllegalArgumentException("Double-booking violation: You already have a pending or approved leave request overlapping with the selected dates (" + dto.getStartDate() + " to " + dto.getEndDate() + ").");
        }

        // 2. Balance Verification & Quota Guard
        ensureLeaveBalanceRecord(jdbcTemplate, employeeId, dto.getPolicyId(), requestYear);
        Double remainingDays = jdbcTemplate.queryForObject(
                "SELECT remaining_days FROM employee_leave_balance WHERE employee_id = ? AND leave_policy_id = ? AND year = ?",
                Double.class, employeeId, dto.getPolicyId(), requestYear
        );

        if (remainingDays != null && requestedDays > remainingDays) {
            throw new IllegalArgumentException("Insufficient leave balance: Requested " + requestedDays + " days exceeds your remaining balance of " + remainingDays + " days.");
        }

        String requestId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status) " +
                        "VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'PENDING')",
                requestId, employeeId, dto.getPolicyId(), dto.getStartDate(), dto.getEndDate(), dto.getReason()
        );

        // Update pending days in balance
        jdbcTemplate.update(
                "UPDATE employee_leave_balance SET pending_days = pending_days + ? WHERE employee_id = ? AND leave_policy_id = ? AND year = ?",
                requestedDays, employeeId, dto.getPolicyId(), requestYear
        );

        log.info("Leave request submitted: id={} employee={} days={}", requestId, email, requestedDays);
    }

    @Override
    @Auditable(action = "LEAVE_STATUS_UPDATE", entity = "LeaveRequest")
    public void updateRequestStatus(String approverEmail, String id, LeaveStatusUpdateDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String approverEmpId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, approverEmail);

        if (!canApproveLeave(jdbcTemplate, approverEmpId)) {
            throw new SecurityException("Forbidden: You do not have permission to approve or reject leave requests.");
        }

        Map<String, Object> req = jdbcTemplate.queryForMap(
                "SELECT employee_id, leave_policy_id, start_date, end_date, status FROM leave_request WHERE id = ?", id
        );

        String applicantEmpId = (String) req.get("employee_id");
        String policyId = (String) req.get("leave_policy_id");
        String currentStatus = (String) req.get("status");
        String newStatus = dto.getStatus().toUpperCase();

        // Prevent self-approval
        if (approverEmpId.equals(applicantEmpId)) {
            throw new IllegalArgumentException("Self-approval prohibited: You cannot approve or reject your own leave request.");
        }

        java.sql.Date startSql = (java.sql.Date) req.get("start_date");
        java.sql.Date endSql = (java.sql.Date) req.get("end_date");
        LocalDate start = startSql.toLocalDate();
        LocalDate end = endSql.toLocalDate();
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        int year = start.getYear();

        ensureLeaveBalanceRecord(jdbcTemplate, applicantEmpId, policyId, year);

        // State Machine Balance Ledger Adjustments
        if ("APPROVED".equals(newStatus) && !"APPROVED".equals(currentStatus)) {
            // Deduct balance & log ledger entry
            jdbcTemplate.update(
                    "UPDATE employee_leave_balance SET used_days = used_days + ?, remaining_days = remaining_days - ?, " +
                            "pending_days = GREATEST(0, pending_days - ?) WHERE employee_id = ? AND leave_policy_id = ? AND year = ?",
                    days, days, days, applicantEmpId, policyId, year
            );

            jdbcTemplate.update(
                    "INSERT INTO leave_balance_ledger (id, employee_id, leave_policy_id, transaction_type, days, reference_id, reason, performed_by) " +
                            "VALUES (?, ?, ?, 'DEDUCTION', ?, ?, 'Leave Request Approved', ?)",
                    UUID.randomUUID().toString(), applicantEmpId, policyId, -days, id, approverEmail
            );
        } else if (("REJECTED".equals(newStatus) || "CANCELLED".equals(newStatus) || "REVOKED".equals(newStatus)) && "APPROVED".equals(currentStatus)) {
            // Revert previously approved leave
            jdbcTemplate.update(
                    "UPDATE employee_leave_balance SET used_days = GREATEST(0, used_days - ?), remaining_days = remaining_days + ? " +
                            "WHERE employee_id = ? AND leave_policy_id = ? AND year = ?",
                    days, days, applicantEmpId, policyId, year
            );

            jdbcTemplate.update(
                    "INSERT INTO leave_balance_ledger (id, employee_id, leave_policy_id, transaction_type, days, reference_id, reason, performed_by) " +
                            "VALUES (?, ?, ?, 'REVERSAL', ?, ?, 'Leave Request Reverted/Cancelled', ?)",
                    UUID.randomUUID().toString(), applicantEmpId, policyId, days, id, approverEmail
            );
        } else if ("REJECTED".equals(newStatus) && "PENDING".equals(currentStatus)) {
            jdbcTemplate.update(
                    "UPDATE employee_leave_balance SET pending_days = GREATEST(0, pending_days - ?) " +
                            "WHERE employee_id = ? AND leave_policy_id = ? AND year = ?",
                    days, applicantEmpId, policyId, year
            );
        }

        jdbcTemplate.update(
                "UPDATE leave_request SET status = ?, approved_by = ? WHERE id = ?",
                newStatus, approverEmail, id
        );

        log.info("Leave request status updated: id={} status={} by={}", id, newStatus, approverEmail);
    }

    @Override
    public Map<String, Object> processYearEndReset() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        int currentYear = LocalDate.now().getYear();

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("activeYear", currentYear);
        res.put("message", "Annual Leave Reset completed successfully.");
        return res;
    }

    @Override
    @Auditable(action = "LEAVE_DELETE", entity = "LeaveRequest")
    public void deleteRequest(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE leave_request SET deleted = TRUE WHERE id = ?", id);
    }
}
