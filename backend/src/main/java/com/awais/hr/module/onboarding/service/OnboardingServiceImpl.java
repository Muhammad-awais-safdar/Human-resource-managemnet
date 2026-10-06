package com.awais.hr.module.onboarding.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.onboarding.dto.PolicySignatureRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class OnboardingServiceImpl implements OnboardingService {

    private static final Logger log = LoggerFactory.getLogger(OnboardingServiceImpl.class);
    private final DataSource dataSource;

    public OnboardingServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    @Override
    public List<Map<String, Object>> getTasks(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String employeeId = getEmployeeId(jdbcTemplate, email);

        List<Map<String, Object>> tasks = jdbcTemplate.queryForList(
                "SELECT id, task_name, description, status_completed, due_date FROM onboarding_task WHERE employee_id = ?",
                employeeId
        );

        if (tasks.isEmpty()) {
            String t1 = UUID.randomUUID().toString();
            String t2 = UUID.randomUUID().toString();
            String t3 = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO onboarding_task (id, employee_id, task_name, description, due_date) VALUES (?, ?, ?, ?, CURRENT_DATE + 3)",
                    t1, employeeId, "Complete IT Setup", "Configure local credentials and VPN connections");
            jdbcTemplate.update("INSERT INTO onboarding_task (id, employee_id, task_name, description, due_date) VALUES (?, ?, ?, ?, CURRENT_DATE + 5)",
                    t2, employeeId, "Review Compliance Policies", "Read and sign the workspace code of conduct policies");
            jdbcTemplate.update("INSERT INTO onboarding_task (id, employee_id, task_name, description, due_date) VALUES (?, ?, ?, ?, CURRENT_DATE + 7)",
                    t3, employeeId, "Submit Bank Details", "Upload payroll payout bank numbers");

            tasks = jdbcTemplate.queryForList(
                    "SELECT id, task_name, description, status_completed, due_date FROM onboarding_task WHERE employee_id = ?",
                    employeeId
            );
        }
        return tasks;
    }

    @Override
    public void completeTask(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE onboarding_task SET status_completed = TRUE WHERE id = ?", id);
        log.info("Onboarding task completed: {}", id);
    }

    @Override
    public List<Map<String, Object>> getAssets(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String employeeId = getEmployeeId(jdbcTemplate, email);

        List<Map<String, Object>> assets = jdbcTemplate.queryForList(
                "SELECT id, asset_name, asset_code, allocated_at, returned_at FROM asset_allocation WHERE employee_id = ?",
                employeeId
        );

        if (assets.isEmpty()) {
            String assetId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO asset_allocation (id, employee_id, asset_name, asset_code) VALUES (?, ?, ?, ?)",
                    assetId, employeeId, "Developer MacBook Pro 16", "DEV-MBP-992"
            );

            assets = jdbcTemplate.queryForList(
                    "SELECT id, asset_name, asset_code, allocated_at, returned_at FROM asset_allocation WHERE employee_id = ?",
                    employeeId
            );
        }
        return assets;
    }

    @Override
    public void logSignature(PolicySignatureRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal instanceof String ? (String) principal : "anonymous@user.com";
        String employeeId = getEmployeeId(jdbcTemplate, email);

        jdbcTemplate.update(
                "INSERT INTO onboarding_policy_signature (id, employee_id, name, document) VALUES (?, ?, ?, ?)",
                UUID.randomUUID().toString(), employeeId, dto.getName(), dto.getDocument()
        );
        log.info("[COMPLIANCE SIGNATURE] Policy agreement logged for: {} - signed document: {}", dto.getName(), dto.getDocument());
    }

    @Override
    @Auditable(action = "ONBOARDING_INITIATE", entity = "EmployeeOnboarding")
    public Map<String, Object> initiateOnboarding(String employeeId, String hrEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String onboardingId = UUID.randomUUID().toString();

        jdbc.update(
                "INSERT INTO employee_onboarding (id, employee_id, status, start_date) VALUES (?, ?, 'INITIATED', CURRENT_DATE)",
                onboardingId, employeeId
        );

        createClearanceTask(jdbc, "ONBOARDING", onboardingId, "IT", "Provision Hardware & Workspace Credentials");
        createClearanceTask(jdbc, "ONBOARDING", onboardingId, "HR", "Sign Non-Disclosure & Compliance Agreements");
        createClearanceTask(jdbc, "ONBOARDING", onboardingId, "FINANCE", "Setup Direct Deposit Payroll & Tax Information");

        log.info("Onboarding workflow initiated: onboardingId={} empId={} by={}", onboardingId, employeeId, hrEmail);
        return Map.of("onboardingId", onboardingId, "employeeId", employeeId, "status", "INITIATED");
    }

    @Override
    @Auditable(action = "CLEARANCE_TASK_COMPLETE", entity = "CrossDeptClearanceTask")
    public void completeClearanceTask(String taskId, String actorEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update(
                "UPDATE cross_dept_clearance_task SET status = 'COMPLETED', completed_by = ?, completed_at = NOW() WHERE id = ?",
                actorEmail, taskId
        );
        log.info("Cross-department clearance task completed: taskId={} by={}", taskId, actorEmail);
    }

    @Override
    @Auditable(action = "ONBOARDING_COMPLETE", entity = "EmployeeOnboarding")
    public void completeOnboarding(String onboardingId, String hrEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        Integer pendingCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM cross_dept_clearance_task WHERE reference_id = ? AND status = 'PENDING'",
                Integer.class, onboardingId
        );

        if (pendingCount != null && pendingCount > 0) {
            throw new IllegalStateException("Onboarding Clearance Guard: All cross-department tasks must be completed before finalizing onboarding (" + pendingCount + " tasks pending).");
        }

        Map<String, Object> onboarding = jdbc.queryForMap("SELECT employee_id FROM employee_onboarding WHERE id = ?", onboardingId);
        String employeeId = (String) onboarding.get("employee_id");

        jdbc.update("UPDATE employee_onboarding SET status = 'COMPLETED', completed_at = NOW() WHERE id = ?", onboardingId);

        // Update employee lifecycle to ACTIVE
        jdbc.update("UPDATE employee SET status = 'ACTIVE' WHERE id = ?", employeeId);

        jdbc.update(
                "INSERT INTO employee_lifecycle_event (id, employee_id, previous_status, new_status, reason, created_by) " +
                        "VALUES (?, ?, 'PROBATION', 'ACTIVE', 'Onboarding completed successfully', ?)",
                UUID.randomUUID().toString(), employeeId, hrEmail
        );

        log.info("Onboarding completed successfully: onboardingId={} empId={}", onboardingId, employeeId);
    }

    @Override
    @Auditable(action = "OFFBOARDING_INITIATE", entity = "EmployeeOffboarding")
    public Map<String, Object> initiateOffboarding(String employeeId, String resignationDate, String lastWorkingDay, String reason, String hrEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String offboardingId = UUID.randomUUID().toString();

        jdbc.update(
                "INSERT INTO employee_offboarding (id, employee_id, status, resignation_date, last_working_day, reason) " +
                        "VALUES (?, ?, 'INITIATED', CAST(? AS DATE), CAST(? AS DATE), ?)",
                offboardingId, employeeId, resignationDate, lastWorkingDay, reason
        );

        // Update employee lifecycle to NOTICE_PERIOD
        jdbc.update("UPDATE employee SET status = 'NOTICE_PERIOD' WHERE id = ?", employeeId);

        jdbc.update(
                "INSERT INTO employee_lifecycle_event (id, employee_id, previous_status, new_status, reason, created_by) " +
                        "VALUES (?, ?, 'ACTIVE', 'NOTICE_PERIOD', ?, ?)",
                UUID.randomUUID().toString(), employeeId, reason != null ? reason : "Resignation initiated", hrEmail
        );

        createClearanceTask(jdbc, "OFFBOARDING", offboardingId, "IT", "Revoke Single Sign-On Access & De-provision VPN Credentials");
        createClearanceTask(jdbc, "OFFBOARDING", offboardingId, "HR", "Conduct Exit Interview & Collect Employee Badge");
        createClearanceTask(jdbc, "OFFBOARDING", offboardingId, "FINANCE", "Clear Company Expense Cards & Calculate Final Payroll Settlement");
        createClearanceTask(jdbc, "OFFBOARDING", offboardingId, "FACILITIES", "Collect Security Keys & Desk Deallocation");

        log.info("Offboarding workflow initiated: offboardingId={} empId={} lastWorkingDay={}", offboardingId, employeeId, lastWorkingDay);
        return Map.of("offboardingId", offboardingId, "employeeId", employeeId, "status", "INITIATED");
    }

    @Override
    @Auditable(action = "OFFBOARDING_CLEARANCE_COMPLETE", entity = "EmployeeOffboarding")
    public void completeOffboarding(String offboardingId, String hrEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        Integer pendingCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM cross_dept_clearance_task WHERE reference_id = ? AND status = 'PENDING'",
                Integer.class, offboardingId
        );

        if (pendingCount != null && pendingCount > 0) {
            throw new IllegalStateException("Cross-Department Clearance Guard: All IT, HR, Finance, and Facilities clearance tasks must be completed before offboarding finalization (" + pendingCount + " tasks pending).");
        }

        Map<String, Object> offboarding = jdbc.queryForMap("SELECT employee_id FROM employee_offboarding WHERE id = ?", offboardingId);
        String employeeId = (String) offboarding.get("employee_id");

        jdbc.update("UPDATE employee_offboarding SET status = 'COMPLETED', completed_at = NOW() WHERE id = ?", offboardingId);

        // Transition employee status to TERMINATED
        jdbc.update("UPDATE employee SET status = 'TERMINATED' WHERE id = ?", employeeId);

        jdbc.update(
                "INSERT INTO employee_lifecycle_event (id, employee_id, previous_status, new_status, reason, created_by) " +
                        "VALUES (?, ?, 'NOTICE_PERIOD', 'TERMINATED', 'Cross-department offboarding clearance finalized', ?)",
                UUID.randomUUID().toString(), employeeId, hrEmail
        );

        log.info("Offboarding finalized & employee terminated: offboardingId={} empId={}", offboardingId, employeeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClearanceTasks(String referenceId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, workflow_type, reference_id, department, task_name, status, completed_by, completed_at, created_at " +
                        "FROM cross_dept_clearance_task WHERE reference_id = ? ORDER BY department, created_at",
                referenceId
        );
    }

    private void createClearanceTask(JdbcTemplate jdbc, String type, String refId, String dept, String taskName) {
        jdbc.update(
                "INSERT INTO cross_dept_clearance_task (id, workflow_type, reference_id, department, task_name, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
                UUID.randomUUID().toString(), type, refId, dept, taskName
        );
    }
}
