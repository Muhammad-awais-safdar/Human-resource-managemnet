package com.awais.hr.module.approvals.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ApprovalServiceImpl implements ApprovalService {

    private final DataSource dataSource;

    public ApprovalServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingApprovals() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> pending = new ArrayList<>();

        try {
            // 1. Fetch pending leaves
            List<Map<String, Object>> leaves = jdbc.queryForList(
                    "SELECT lr.id, 'LEAVE' as type, lr.employee_id, e.first_name, e.last_name, e.employee_code, " +
                    "CONCAT('Leave Request (', lp.name, ') from ', lr.start_date, ' to ', lr.end_date) as details, " +
                    "lr.reason, CURRENT_TIMESTAMP as created_at " +
                    "FROM leave_request lr " +
                    "JOIN employee e ON lr.employee_id = e.id " +
                    "JOIN leave_policy lp ON lr.leave_policy_id = lp.id " +
                    "WHERE lr.status = 'PENDING'"
            );
            pending.addAll(leaves);
        } catch (Exception e) {
            System.err.println("Error fetching pending leaves: " + e.getMessage());
        }

        try {
            // 2. Fetch pending expenses
            List<Map<String, Object>> expenses = jdbc.queryForList(
                    "SELECT ec.id, 'EXPENSE' as type, ec.employee_id, e.first_name, e.last_name, e.employee_code, " +
                    "CONCAT('Expense Claim: $', ec.amount, ' - ', ec.description) as details, " +
                    "ec.description as reason, CURRENT_TIMESTAMP as created_at " +
                    "FROM expense_claim ec " +
                    "JOIN employee e ON ec.employee_id = e.id " +
                    "WHERE ec.status = 'PENDING'"
            );
            pending.addAll(expenses);
        } catch (Exception e) {
            System.err.println("Error fetching pending expenses: " + e.getMessage());
        }

        try {
            // 3. Fetch pending travel
            List<Map<String, Object>> travel = jdbc.queryForList(
                    "SELECT tr.id, 'TRAVEL' as type, tr.employee_id, e.first_name, e.last_name, e.employee_code, " +
                    "CONCAT('Travel Request to ', tr.destination, ' from ', tr.start_date, ' to ', tr.end_date) as details, " +
                    "'' as reason, CURRENT_TIMESTAMP as created_at " +
                    "FROM travel_request tr " +
                    "JOIN employee e ON tr.employee_id = e.id " +
                    "WHERE tr.status = 'PENDING'"
            );
            pending.addAll(travel);
        } catch (Exception e) {
            System.err.println("Error fetching pending travel: " + e.getMessage());
        }

        try {
            // 4. Fetch pending timesheets
            List<Map<String, Object>> timesheets = jdbc.queryForList(
                    "SELECT tl.id, 'TIMESHEET' as type, tl.employee_id, e.first_name, e.last_name, e.employee_code, " +
                    "CONCAT('Timesheet Log for project ', p.name, ' on ', tl.work_date, ': ', tl.hours_worked, ' hours') as details, " +
                    "'' as reason, CURRENT_TIMESTAMP as created_at " +
                    "FROM timesheet_log tl " +
                    "JOIN employee e ON tl.employee_id = e.id " +
                    "JOIN project p ON tl.project_id = p.id " +
                    "WHERE tl.status = 'PENDING'"
            );
            pending.addAll(timesheets);
        } catch (Exception e) {
            System.err.println("Error fetching pending timesheets: " + e.getMessage());
        }

        try {
            // 5. Fetch pending resignations
            List<Map<String, Object>> resignations = jdbc.queryForList(
                    "SELECT r.id, 'RESIGNATION' as type, r.employee_id, e.first_name, e.last_name, e.employee_code, " +
                    "CONCAT('Resignation Notice: Resign Date: ', r.resignation_date, ', Last Working Date: ', r.last_working_date) as details, " +
                    "r.reason, CURRENT_TIMESTAMP as created_at " +
                    "FROM resignation r " +
                    "JOIN employee e ON r.employee_id = e.id " +
                    "WHERE r.status = 'PENDING'"
            );
            pending.addAll(resignations);
        } catch (Exception e) {
            System.err.println("Error fetching pending resignations: " + e.getMessage());
        }

        try {
            // 6. Fetch pending exit clearances
            List<Map<String, Object>> clearances = jdbc.queryForList(
                    "SELECT ec.id, 'CLEARANCE' as type, ec.employee_id, e.first_name, e.last_name, e.employee_code, " +
                    "'Exit Clearance Checksheets Clearance Auditing' as details, " +
                    "'' as reason, CURRENT_TIMESTAMP as created_at " +
                    "FROM exit_clearance ec " +
                    "JOIN employee e ON ec.employee_id = e.id " +
                    "WHERE ec.status = 'PENDING'"
            );
            pending.addAll(clearances);
        } catch (Exception e) {
            System.err.println("Error fetching pending clearances: " + e.getMessage());
        }

        return pending;
    }

    @Override
    public void actionApproval(String type, String id, String action, String comment) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String finalStatus = "APPROVED".equalsIgnoreCase(action) ? "APPROVED" : "REJECTED";

        if ("LEAVE".equalsIgnoreCase(type)) {
            jdbc.update("UPDATE leave_request SET status = ? WHERE id = ?", finalStatus, id);
        } else if ("EXPENSE".equalsIgnoreCase(type)) {
            jdbc.update("UPDATE expense_claim SET status = ? WHERE id = ?", finalStatus, id);
        } else if ("TRAVEL".equalsIgnoreCase(type)) {
            jdbc.update("UPDATE travel_request SET status = ? WHERE id = ?", finalStatus, id);
        } else if ("TIMESHEET".equalsIgnoreCase(type)) {
            jdbc.update("UPDATE timesheet_log SET status = ? WHERE id = ?", finalStatus, id);
        } else if ("RESIGNATION".equalsIgnoreCase(type)) {
            jdbc.update("UPDATE resignation SET status = ? WHERE id = ?", finalStatus, id);
        } else if ("CLEARANCE".equalsIgnoreCase(type)) {
            if ("APPROVED".equalsIgnoreCase(action)) {
                jdbc.update("UPDATE exit_clearance SET department_approved = TRUE, it_approved = TRUE, finance_approved = TRUE, status = 'CLEARED' WHERE id = ?", id);
            } else {
                jdbc.update("UPDATE exit_clearance SET status = 'REJECTED' WHERE id = ?", id);
            }
        } else {
            throw new IllegalArgumentException("Unknown approval type: " + type);
        }
    }
}
