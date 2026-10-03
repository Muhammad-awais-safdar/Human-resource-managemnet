package com.awais.hr.config;

import com.awais.hr.module.tenant.dto.TenantRegisterRequestDTO;
import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.repository.TenantRepository;
import com.awais.hr.module.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final TenantService tenantService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.clear();
        log.info("========================================================================");
        log.info("🚀 EXECUTING ENTERPRISE TENANT DATA SEEDER: E-PROCESSING SYSTEMS (ONELOAD)");
        log.info("========================================================================");

        String defaultSubdomain = "awais";
        String defaultCompanyName = "E-Processing Systems (Pvt) Ltd";
        String defaultAdminEmail = "admin@ep-systems.com";

        Optional<Tenant> existingTenant = Optional.empty();
        try {
            existingTenant = tenantRepository.findBySubdomain(defaultSubdomain);
        } catch (Exception e) {
            log.error("EXCEPTION IN FIND_BY_SUBDOMAIN: ", e);
        }
        Tenant tenant;
        if (existingTenant.isPresent()) {
            tenant = existingTenant.get();
            log.info("Found existing master tenant record: {} (Subdomain: {})", tenant.getName(), tenant.getSubdomain());
        } else {
            log.info("Provisioning physical database & schema for E-Processing Systems subdomain: {}", defaultSubdomain);
            TenantRegisterRequestDTO request = new TenantRegisterRequestDTO();
            request.setCompanyName(defaultCompanyName);
            request.setSubdomain(defaultSubdomain);
            request.setAdminEmail(defaultAdminEmail);
            request.setAdminPassword("admin123");
            request.setLogoUrl("https://oneloadpk.com/wp-content/uploads/2021/04/oneload-logo.png");
            request.setPrimaryColor("#0284c7");
            request.setSecondaryColor("#0f172a");

            try {
                tenant = tenantService.registerNewTenant(request);
            } catch (Exception e) {
                log.warn("Notice during tenant registration: {}", e.getMessage(), e);
                com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.clear();
                tenant = tenantRepository.findBySubdomain(defaultSubdomain).orElse(null);
            }
        }

        if (tenant != null) {
            DataSource tenantDataSource = tenantService.getTenantDataSource(tenant.getId());
            if (tenantDataSource != null) {
                seedComprehensiveTenantData(tenantDataSource, defaultAdminEmail);
            }
        }

        logSeederCredentialSummary();
    }

    private void seedComprehensiveTenantData(DataSource tenantDataSource, String adminEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(tenantDataSource);

        log.info("Seeding security permissions and multi-role employee catalog for E-Processing Systems...");

        // 1. Seed Core Permissions with Human-Readable UI Labels & Module Mapping
        record PermMeta(String name, String desc, String module, String feature, String action, String label, boolean sensitive) {}
        List<PermMeta> permList = List.of(
                new PermMeta("corehr:employee:read", "Read access to employee profiles and directories", "CORE_HR", "EMPLOYEES", "READ", "View Employee Directory & Profiles", false),
                new PermMeta("corehr:employee:write", "Write & update access to employee records", "CORE_HR", "EMPLOYEES", "WRITE", "Create & Edit Employee Records", false),
                new PermMeta("corehr:org:write", "Manage organization structure and tree nodes", "CORE_HR", "ORG_STRUCTURE", "WRITE", "Manage Org Chart & Departments", false),
                new PermMeta("corehr:settings:write", "Modify white-label tenant branding configurations", "CORE_HR", "SETTINGS", "WRITE", "Configure Tenant Branding & Settings", false),
                new PermMeta("payroll:salary:read", "View employee salary structures and payslips", "PAYROLL", "SALARY", "READ", "View Employee Salaries & Payslips", false),
                new PermMeta("payroll:salary:write", "Calculate monthly salaries and deductions", "PAYROLL", "SALARY", "WRITE", "Calculate Salaries & Deductions", false),
                new PermMeta("payroll:salary:approve", "Approve monthly payroll runs for disbursement", "PAYROLL", "DISBURSEMENT", "APPROVE", "Approve Monthly Payroll Runs", true),
                new PermMeta("payroll:salary:process", "Execute automated bank transfer disbursements", "PAYROLL", "DISBURSEMENT", "PROCESS", "Execute Direct Bank Disbursements", true),
                new PermMeta("attendance:log:read", "View daily attendance & biometric punch logs", "ATTENDANCE", "LOGS", "READ", "View Daily Attendance & Punch Logs", false),
                new PermMeta("attendance:log:write", "Adjust clock-in/out timestamps and overtime", "ATTENDANCE", "LOGS", "WRITE", "Edit Attendance & Overtime Logs", false),
                new PermMeta("leave:request:read", "View leave balances and time-off requests", "LEAVE", "REQUESTS", "READ", "View Vacation & Leave Requests", false),
                new PermMeta("leave:request:approve", "Approve or reject employee vacation applications", "LEAVE", "REQUESTS", "APPROVE", "Approve Vacation & Leave Applications", false),
                new PermMeta("recruitment:job:write", "Publish job requisitions and candidate pipeline", "RECRUITMENT", "ATS", "WRITE", "Manage Job Requisitions & Candidates", false),
                new PermMeta("audit:read", "View security audit ledger logs", "AUDIT", "SECURITY_LOGS", "READ", "View Security Audit Logs", false)
        );

        Map<String, String> permIdMap = new HashMap<>();
        for (PermMeta p : permList) {
            String permId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO permission (id, name, description, module_key, feature_key, action_key, ui_label, is_sensitive) VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE module_key = VALUES(module_key), ui_label = VALUES(ui_label), is_sensitive = VALUES(is_sensitive)",
                    permId, p.name(), p.desc(), p.module(), p.feature(), p.action(), p.label(), p.sensitive()
            );
            List<String> foundMap = jdbcTemplate.queryForList(
                    "SELECT id FROM permission WHERE name = ?", String.class, p.name());
            if (!foundMap.isEmpty()) {
                permIdMap.put(p.name(), foundMap.get(0));
            }
        }

        // 2. Seed All Standard Roles with System Role Guard Flag
        Map<String, String> roles = Map.of(
                "SYSTEM_ADMIN", "Full platform system administrator",
                "TENANT_ADMIN", "E-Processing Systems workspace administrator",
                "HR_MANAGER", "HR director & workforce operations lead",
                "LINE_MANAGER", "Territory sales & field operations supervisor",
                "FINANCE_ADMIN", "Finance accountant & disbursement maker-checker",
                "RECRUITER", "Talent acquisition lead",
                "AUDITOR", "SBP compliance & security auditor",
                "EMPLOYEE", "Field agent & self-service employee"
        );

        Map<String, String> roleIdMap = new HashMap<>();
        for (Map.Entry<String, String> entry : roles.entrySet()) {
            String roleId = UUID.randomUUID().toString();
            boolean isSystem = List.of("SYSTEM_ADMIN", "TENANT_ADMIN", "EMPLOYEE", "HR_MANAGER").contains(entry.getKey());
            jdbcTemplate.update(
                    "INSERT INTO role (id, name, description, is_system_role, status) VALUES (?, ?, ?, ?, 'ACTIVE') " +
                    "ON DUPLICATE KEY UPDATE is_system_role = VALUES(is_system_role)",
                    roleId, entry.getKey(), entry.getValue(), isSystem
            );
            List<String> foundRole = jdbcTemplate.queryForList(
                    "SELECT id FROM role WHERE name = ?", String.class, entry.getKey());
            if (!foundRole.isEmpty()) {
                roleIdMap.put(entry.getKey(), foundRole.get(0));
            }
        }

        // Bind Permissions to Roles with Access Scopes
        for (String roleName : roleIdMap.keySet()) {
            String rId = roleIdMap.get(roleName);
            for (String pId : permIdMap.values()) {
                jdbcTemplate.update(
                        "INSERT IGNORE INTO role_permission (role_id, permission_id, access_scope) VALUES (?, ?, 'COMPANY')",
                        rId, pId
                );
            }
        }

        // 3. Seed Default Vacation & Leave Types
        log.info("Seeding E-Processing Systems leave policies...");
        List<Object[]> leaveTypes = List.of(
                new Object[]{UUID.randomUUID().toString(), "Annual Vacation", 20, "Paid standard annual vacation days"},
                new Object[]{UUID.randomUUID().toString(), "Casual Leave", 10, "Short-notice casual leave allowance"},
                new Object[]{UUID.randomUUID().toString(), "Sick Leave", 12, "Medical emergency paid leave"},
                new Object[]{UUID.randomUUID().toString(), "Field Duty Off", 14, "Compensatory time off for weekend merchant drives"},
                new Object[]{UUID.randomUUID().toString(), "Maternity Leave", 90, "Maternal care paid leave allocation"},
                new Object[]{UUID.randomUUID().toString(), "Paternity Leave", 14, "Paternal support leave allocation"},
                new Object[]{UUID.randomUUID().toString(), "Unpaid Leave / LOP", 30, "Loss of Pay uncompensated leave"}
        );

        for (Object[] lt : leaveTypes) {
            jdbcTemplate.update(
                    "INSERT IGNORE INTO leave_policy (id, name, allowance, description) VALUES (?, ?, ?, ?)",
                    lt[0], lt[1], lt[2], lt[3]
            );
        }

        // 4. Seed E-Processing Systems (OneLoad) Employee Catalog
        log.info("Seeding E-Processing Systems staff & field manager accounts...");

        String defaultHashedPassword = passwordEncoder.encode("password123");

        List<Object[]> seedUsers = List.of(
                new Object[]{"EPS-001", "Faizan", "Siddiqui (Tenant Admin)", "tenant.admin@ep-systems.com", defaultHashedPassword, "TENANT_ADMIN"},
                new Object[]{"EPS-002", "Zainab", "Ali (HR Director)", "hr.manager@ep-systems.com", defaultHashedPassword, "HR_MANAGER"},
                new Object[]{"EPS-003", "Usman", "Khan (Territory Lead)", "line.manager@ep-systems.com", defaultHashedPassword, "LINE_MANAGER"},
                new Object[]{"EPS-004", "Tariq", "Mahmood (Finance Lead)", "finance.admin@ep-systems.com", defaultHashedPassword, "FINANCE_ADMIN"},
                new Object[]{"EPS-005", "Ayesha", "Malik (TA Lead)", "recruiter@ep-systems.com", defaultHashedPassword, "RECRUITER"},
                new Object[]{"EPS-006", "Bilal", "Ahmed (Compliance)", "auditor@ep-systems.com", defaultHashedPassword, "AUDITOR"},
                new Object[]{"EPS-007", "Hamza", "Riaz (Field Officer)", "employee.john@ep-systems.com", defaultHashedPassword, "EMPLOYEE"},
                new Object[]{"EPS-008", "Sana", "Sheikh (Support Rep)", "employee.jane@ep-systems.com", defaultHashedPassword, "EMPLOYEE"}
        );

        for (Object[] user : seedUsers) {
            String empCode = (String) user[0];
            String firstName = (String) user[1];
            String lastName = (String) user[2];
            String email = (String) user[3];
            String passHash = (String) user[4];
            String roleName = (String) user[5];

            // Check if employee already exists
            List<String> existingEmps = jdbcTemplate.queryForList("SELECT id FROM employee WHERE email = ?", String.class, email);
            String empId;
            if (existingEmps.isEmpty()) {
                empId = UUID.randomUUID().toString();
                jdbcTemplate.update(
                        "INSERT INTO employee (id, employee_code, first_name, last_name, email, password, status, joining_date) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_DATE)",
                        empId, empCode, firstName, lastName, email, passHash
                );
            } else {
                empId = existingEmps.get(0);
                jdbcTemplate.update(
                        "UPDATE employee SET password = ? WHERE id = ?", passHash, empId
                );
            }

            // Map employee to assigned role
            String targetRoleId = roleIdMap.get(roleName);
            if (targetRoleId != null) {
                jdbcTemplate.update(
                        "INSERT IGNORE INTO employee_role (employee_id, role_id) VALUES (?, ?)",
                        empId, targetRoleId
                );
            }
        }

        // 5. Seed E-Processing Systems Org Hierarchy
        log.info("Seeding E-Processing Systems organizational structure & departments...");
        
        jdbcTemplate.update("DELETE FROM org_unit");

        // Root Legal Entity
        String legalEntityId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'LEGAL_ENTITY', NULL)", 
                legalEntityId, "E-Processing Systems (Pvt) Ltd");

        // Executive & Key Departments
        String execId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                execId, "Executive Leadership Desk", legalEntityId);

        String fintechEngId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                fintechEngId, "OneLoad FinTech Product & Engineering", legalEntityId);

        String fieldOpsId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                fieldOpsId, "Field Merchant & Agent Operations", legalEntityId);

        String financeId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'COST_CENTER', ?)", 
                financeId, "Finance & Interbank Disbursement", legalEntityId);

        String hrComplianceId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                hrComplianceId, "Human Resources & SBP Compliance", legalEntityId);

        // Sub-Teams
        String supportDeskId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'TEAM', ?)", 
                supportDeskId, "24/7 Agent Operations Call Center", fieldOpsId);

        String territoryMgmtId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'TEAM', ?)", 
                territoryMgmtId, "Territory Sales & Retail Acquisition", fieldOpsId);

        // 6. Seed FinTech Engine Sample Data (V52 Platform Engines)
        log.info("Seeding OneLoad FinTech Commission & Field Mileage Engines...");

        // Seed Commission Rules
        jdbcTemplate.update(
                "INSERT IGNORE INTO commission_rule (id, rule_name, industry_code, rule_type, target_amount, commission_rate, status) VALUES " +
                "(?, 'OneLoad Merchant Acquisition Bonus', 'FINTECH_RETAIL', 'MERCHANT_ONBOARDING', 50000.00, 2.50, 'ACTIVE')",
                UUID.randomUUID().toString()
        );
        jdbcTemplate.update(
                "INSERT IGNORE INTO commission_rule (id, rule_name, industry_code, rule_type, target_amount, commission_rate, status) VALUES " +
                "(?, 'Territory Transaction Volume Incentive', 'FINTECH_RETAIL', 'VOLUME_TIER', 200000.00, 1.50, 'ACTIVE')",
                UUID.randomUUID().toString()
        );

        // Seed Sample Maker-Checker Request
        jdbcTemplate.update(
                "INSERT IGNORE INTO maker_checker_request (id, request_type, maker_employee_id, checker_employee_id, entity_id, change_payload, status) VALUES " +
                "(?, 'BANK_DISBURSEMENT', 'EPS-004', 'EPS-001', 'BATCH-2026-10-01', '{\"disbursementAmount\": 450000.00, \"channel\": \"RAST_SPI\"}', 'PENDING_CHECKER_APPROVAL')",
                UUID.randomUUID().toString()
        );

        // Seed Sample Shift Schedule for 24/7 Call Center
        jdbcTemplate.update(
                "INSERT IGNORE INTO shift_schedule (id, name, start_time, end_time) VALUES (?, 'FinTech Support General Shift', '09:00:00', '17:00:00')",
                UUID.randomUUID().toString()
        );
        jdbcTemplate.update(
                "INSERT IGNORE INTO shift_schedule (id, name, start_time, end_time) VALUES (?, 'Agent Desk Rotational Night Shift', '21:00:00', '05:00:00')",
                UUID.randomUUID().toString()
        );

        // Seed Job Requisitions
        jdbcTemplate.update(
                "INSERT IGNORE INTO job_requisition (id, title, description, status, openings, salary_range) VALUES (?, 'Senior FinTech Backend Engineer (Java / Spring)', 'Lead high-throughput transaction processing for OneLoad platform.', 'OPEN', 3, 'PKR 350k - 500k')",
                UUID.randomUUID().toString()
        );
        jdbcTemplate.update(
                "INSERT IGNORE INTO job_requisition (id, title, description, status, openings, salary_range) VALUES (?, 'Territory Sales Manager - Central Punjab', 'Drive merchant onboarding & last-mile digital wallet adoption.', 'OPEN', 5, 'PKR 120k - 180k + Commission')",
                UUID.randomUUID().toString()
        );

        log.info("✅ E-Processing Systems (OneLoad) Tenant Seeding Completed Successfully!");
    }

    private void logSeederCredentialSummary() {
        log.info("========================================================================");
        log.info("🔑 E-PROCESSING SYSTEMS (ONELOAD) TENANT CREDENTIAL MATRIX:");
        log.info("========================================================================");
        log.info(" 🛡️ PLATFORM PORTAL (Base Domain / hrm.com):");
        log.info("    - SYSTEM ADMIN     : admin@hrm.com              / Password: admin123");
        log.info(" 🏢 WORKSPACE PORTAL (Subdomain: 'awais.hrm.com'):");
        log.info("    1. TENANT ADMIN    : tenant.admin@ep-systems.com / Password: password123");
        log.info("    2. HR DIRECTOR     : hr.manager@ep-systems.com   / Password: password123");
        log.info("    3. TERRITORY LEAD  : line.manager@ep-systems.com / Password: password123");
        log.info("    4. FINANCE LEAD    : finance.admin@ep-systems.com/ Password: password123");
        log.info("    5. RECRUITER       : recruiter@ep-systems.com    / Password: password123");
        log.info("    6. AUDITOR         : auditor@ep-systems.com      / Password: password123");
        log.info("    7. FIELD OFFICER   : employee.john@ep-systems.com/ Password: password123");
        log.info("    8. SUPPORT REP     : employee.jane@ep-systems.com/ Password: password123");
        log.info("========================================================================");
    }
}

