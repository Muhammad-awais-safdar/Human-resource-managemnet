package com.awais.hr.module.onboarding.service;

import com.awais.hr.module.onboarding.dto.PolicySignatureRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class OnboardingServiceImpl implements OnboardingService {

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
        System.out.println("[COMPLIANCE] Digital policy agreement signature logged: " + dto.getName() + " signed document: " + dto.getDocument());
    }
}
