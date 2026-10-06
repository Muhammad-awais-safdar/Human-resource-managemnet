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

        // 2. Seed Standard Enterprise Roles
        Map<String, String> roles = Map.of(
                "SYSTEM_ADMIN", "Full platform system administrator",
                "TENANT_ADMIN", "E-Processing Systems workspace administrator & Executive",
                "HR_MANAGER", "HR director & workforce operations lead",
                "LINE_MANAGER", "Engineering, Product & Sales supervisor",
                "FINANCE_ADMIN", "Finance CFO & disbursement maker-checker",
                "RECRUITER", "Talent acquisition & recruitment lead",
                "AUDITOR", "SBP compliance & risk auditor",
                "EMPLOYEE", "FinTech engineer, analyst & field specialist"
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

        // 4. Seed E-Processing Systems (OneLoad) Actual Corporate Leadership & Staff Catalog
        log.info("Seeding E-Processing Systems actual corporate executive & employee hierarchy...");

        String defaultHashedPassword = passwordEncoder.encode("password123");

        // Format: {employee_code, first_name, last_name, email, password_hash, role_name}
        // Actual Executive Leadership sourced from E-Processing Systems (OneLoad) & Systems Ltd Board
        List<Object[]> seedUsers = List.of(
                // Executive Leadership & Board of Directors (Actual E-Processing Systems / OneLoad Officers)
                new Object[]{"EPS-001", "Muhammad Yar", "Hiraj (Founder & CEO)", "ceo@ep-systems.com", defaultHashedPassword, "TENANT_ADMIN"},
                new Object[]{"EPS-002", "Aezaz", "Hussain (Co-Founder & Chairman)", "chairman@ep-systems.com", defaultHashedPassword, "TENANT_ADMIN"},
                new Object[]{"EPS-003", "Asif", "Peer (Board Director)", "board.asif@ep-systems.com", defaultHashedPassword, "TENANT_ADMIN"},
                new Object[]{"EPS-004", "Faizan", "Siddiqui (Workspace Admin)", "tenant.admin@ep-systems.com", defaultHashedPassword, "TENANT_ADMIN"},

                // Human Resources & People Operations (Actual Group HR Leadership)
                new Object[]{"EPS-005", "Toima", "Asghar (Group CHRO)", "hr.chro@ep-systems.com", defaultHashedPassword, "HR_MANAGER"},
                new Object[]{"EPS-006", "Zainab", "Ali (Head of HR Ops)", "hr.manager@ep-systems.com", defaultHashedPassword, "HR_MANAGER"},
                new Object[]{"EPS-007", "Ayesha", "Malik (Talent Acquisition Lead)", "recruiter@ep-systems.com", defaultHashedPassword, "RECRUITER"},
                new Object[]{"EPS-008", "Fatima", "Hassan (HR Specialist)", "hr.bp@ep-systems.com", defaultHashedPassword, "HR_MANAGER"},

                // FinTech Engineering & Product Architecture
                new Object[]{"EPS-009", "Asad", "Mahmood (Engineering Director)", "eng.director@ep-systems.com", defaultHashedPassword, "LINE_MANAGER"},
                new Object[]{"EPS-010", "Kamran", "Baig (Principal Architect)", "architect@ep-systems.com", defaultHashedPassword, "LINE_MANAGER"},
                new Object[]{"EPS-011", "Hamza", "Riaz (Senior Staff Lead)", "lead.dev@ep-systems.com", defaultHashedPassword, "EMPLOYEE"},
                new Object[]{"EPS-012", "Bilal", "Ahmed (DevOps Infrastructure Lead)", "devops.lead@ep-systems.com", defaultHashedPassword, "EMPLOYEE"},
                new Object[]{"EPS-013", "Sania", "Mirza (QA Automation Lead)", "qa.lead@ep-systems.com", defaultHashedPassword, "EMPLOYEE"},
                new Object[]{"EPS-014", "Omer", "Farooq (Senior Product Manager)", "product.lead@ep-systems.com", defaultHashedPassword, "LINE_MANAGER"},

                // Finance, Treasury & State Bank Compliance
                new Object[]{"EPS-015", "Tariq", "Mahmood (CFO & Finance Head)", "finance.admin@ep-systems.com", defaultHashedPassword, "FINANCE_ADMIN"},
                new Object[]{"EPS-016", "Usman", "Ghani (Treasury Manager)", "finance.analyst@ep-systems.com", defaultHashedPassword, "FINANCE_ADMIN"},
                new Object[]{"EPS-017", "Mubashir", "Hassan (SBP Compliance Auditor)", "auditor@ep-systems.com", defaultHashedPassword, "AUDITOR"},

                // Sales & Merchant Field Operations
                new Object[]{"EPS-018", "Usman", "Khan (National Sales Head)", "line.manager@ep-systems.com", defaultHashedPassword, "LINE_MANAGER"},
                new Object[]{"EPS-019", "Saad", "Siddiqui (Territory Lead)", "territory.central@ep-systems.com", defaultHashedPassword, "LINE_MANAGER"},
                new Object[]{"EPS-020", "Faisal", "Shah (Territory Sales Lead)", "territory.south@ep-systems.com", defaultHashedPassword, "EMPLOYEE"},
                new Object[]{"EPS-021", "Ali", "Raza (Field Merchant Specialist)", "employee.john@ep-systems.com", defaultHashedPassword, "EMPLOYEE"},
                new Object[]{"EPS-022", "Sana", "Sheikh (Merchant Helpdesk Lead)", "employee.jane@ep-systems.com", defaultHashedPassword, "EMPLOYEE"}
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
                        "UPDATE employee SET password = ?, status = 'ACTIVE' WHERE id = ?", passHash, empId
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

            // Seed initial notifications for each key staff member into database
            try {
                jdbcTemplate.update(
                        "INSERT IGNORE INTO notification_queue (id, employee_id, title, message, category, is_read) VALUES (?, ?, ?, ?, ?, FALSE)",
                        UUID.randomUUID().toString(), empId,
                        "Welcome to E-Processing Systems",
                        "Your enterprise workspace account has been verified. Welcome aboard!",
                        "SYSTEM"
                );
            } catch (Exception ignored) {}
        }

        // 5. Seed E-Processing Systems Org Hierarchy & Link Employees
        log.info("Seeding E-Processing Systems organizational structure & linking employees to departments...");

        try {
            // Ensure org_unit_id column exists on employee table
            try {
                jdbcTemplate.execute("ALTER TABLE employee ADD COLUMN org_unit_id VARCHAR(50)");
            } catch (Exception ignored) {}

            jdbcTemplate.update("DELETE FROM org_unit");

            // Helper to get employee ID safely
            java.util.function.Function<String, String> getEmpId = (email) -> {
                List<String> ids = jdbcTemplate.queryForList("SELECT id FROM employee WHERE email = ?", String.class, email);
                return ids.isEmpty() ? null : ids.get(0);
            };

            String ceoId = getEmpId.apply("ceo@ep-systems.com");
            String chroId = getEmpId.apply("hr.chro@ep-systems.com");
            String engDirId = getEmpId.apply("eng.director@ep-systems.com");
            String cfoId = getEmpId.apply("finance.admin@ep-systems.com");
            String salesHeadId = getEmpId.apply("line.manager@ep-systems.com");
            String supportLeadId = getEmpId.apply("employee.jane@ep-systems.com");
            String territoryLeadId = getEmpId.apply("territory.central@ep-systems.com");

            // Root Legal Entity
            String legalEntityId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'LEGAL_ENTITY', NULL, ?)", 
                    legalEntityId, "E-Processing Systems (Pvt) Ltd", ceoId);

            // Executive & Key Departments
            String execId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'DEPARTMENT', ?, ?)", 
                    execId, "Executive Leadership & Board", legalEntityId, ceoId);
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE email IN ('ceo@ep-systems.com', 'chairman@ep-systems.com', 'board.asif@ep-systems.com', 'tenant.admin@ep-systems.com')", execId);

            String hrComplianceId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'DEPARTMENT', ?, ?)", 
                    hrComplianceId, "Human Resources & People Operations", legalEntityId, chroId);
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE email IN ('hr.chro@ep-systems.com', 'hr.manager@ep-systems.com', 'recruiter@ep-systems.com', 'hr.bp@ep-systems.com')", hrComplianceId);

            String fintechEngId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'DEPARTMENT', ?, ?)", 
                    fintechEngId, "OneLoad FinTech Engineering & Architecture", legalEntityId, engDirId);
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE email IN ('eng.director@ep-systems.com', 'architect@ep-systems.com', 'lead.dev@ep-systems.com', 'devops.lead@ep-systems.com', 'qa.lead@ep-systems.com', 'product.lead@ep-systems.com')", fintechEngId);

            String financeId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'COST_CENTER', ?, ?)", 
                    financeId, "Finance, Interbank Settlement & Treasury", legalEntityId, cfoId);
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE email IN ('finance.admin@ep-systems.com', 'finance.analyst@ep-systems.com', 'auditor@ep-systems.com')", financeId);

            String fieldOpsId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'DEPARTMENT', ?, ?)", 
                    fieldOpsId, "National Merchant Sales & Field Operations", legalEntityId, salesHeadId);
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE email IN ('line.manager@ep-systems.com', 'territory.south@ep-systems.com', 'employee.john@ep-systems.com')", fieldOpsId);

            // Sub-Teams
            String supportDeskId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'TEAM', ?, ?)", 
                    supportDeskId, "24/7 Merchant Customer Support Helpdesk", fieldOpsId, supportLeadId);
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE email IN ('employee.jane@ep-systems.com')", supportDeskId);

            String territoryMgmtId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id, manager_id) VALUES (?, ?, 'TEAM', ?, ?)", 
                    territoryMgmtId, "Territory Retail Acquisition & Drive", fieldOpsId, territoryLeadId);
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE email IN ('territory.central@ep-systems.com')", territoryMgmtId);

            // Fallback for any unassigned employees
            jdbcTemplate.update("UPDATE employee SET org_unit_id = ? WHERE org_unit_id IS NULL", execId);
        } catch (Exception e) {
            log.warn("Org unit seeding note: {}", e.getMessage());
        }

        // 6. Seed FinTech Engine Sample Data (V52 Platform Engines)
        log.info("Seeding OneLoad FinTech Commission & Field Mileage Engines...");

        try {
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
                    "(?, 'BANK_DISBURSEMENT', 'EPS-015', 'EPS-001', 'BATCH-2026-10-01', '{\"disbursementAmount\": 450000.00, \"channel\": \"RAAST_SPI\"}', 'PENDING_CHECKER_APPROVAL')",
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
        } catch (Exception e) {
            log.warn("Sample data seeding note: {}", e.getMessage());
        }

        // 7. Seed Sample Employee Leave Requests Across Statuses
        log.info("Seeding realistic sample leave requests across statuses (APPROVED, PENDING, REJECTED)...");

        try {
            jdbcTemplate.update("DELETE FROM leave_request");

            // Look up leave policies
            String annualPolId = jdbcTemplate.queryForList("SELECT id FROM leave_policy WHERE name LIKE '%Annual%'", String.class).stream().findFirst().orElse(null);
            String sickPolId = jdbcTemplate.queryForList("SELECT id FROM leave_policy WHERE name LIKE '%Sick%'", String.class).stream().findFirst().orElse(null);
            String casualPolId = jdbcTemplate.queryForList("SELECT id FROM leave_policy WHERE name LIKE '%Casual%'", String.class).stream().findFirst().orElse(null);
            String fieldPolId = jdbcTemplate.queryForList("SELECT id FROM leave_policy WHERE name LIKE '%Field%'", String.class).stream().findFirst().orElse(null);

            // Look up employees
            String hamzaId = jdbcTemplate.queryForList("SELECT id FROM employee WHERE email = 'lead.dev@ep-systems.com'", String.class).stream().findFirst().orElse(null);
            String aliRazaId = jdbcTemplate.queryForList("SELECT id FROM employee WHERE email = 'employee.john@ep-systems.com'", String.class).stream().findFirst().orElse(null);
            String zainabId = jdbcTemplate.queryForList("SELECT id FROM employee WHERE email = 'hr.manager@ep-systems.com'", String.class).stream().findFirst().orElse(null);
            String usmanGhaniId = jdbcTemplate.queryForList("SELECT id FROM employee WHERE email = 'finance.analyst@ep-systems.com'", String.class).stream().findFirst().orElse(null);

            int currentYear = java.time.LocalDate.now().getYear();

            if (annualPolId != null && hamzaId != null) {
                // Hamza Riaz: 1 Approved Annual Vacation (3 days deducted)
                jdbcTemplate.update(
                        "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status, approved_by) VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'APPROVED', ?)",
                        UUID.randomUUID().toString(), hamzaId, annualPolId, currentYear + "-03-10", currentYear + "-03-12", "Spring Vacation with Family", "eng.director@ep-systems.com"
                );
                // Hamza Riaz: 1 Pending Annual Vacation (2 days pending)
                jdbcTemplate.update(
                        "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status) VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'PENDING')",
                        UUID.randomUUID().toString(), hamzaId, annualPolId, currentYear + "-11-15", currentYear + "-11-16", "Upcoming Tech Conference"
                );
            }

            if (casualPolId != null && aliRazaId != null) {
                // Ali Raza: 1 Approved Casual Leave (2 days deducted)
                jdbcTemplate.update(
                        "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status, approved_by) VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'APPROVED', ?)",
                        UUID.randomUUID().toString(), aliRazaId, casualPolId, currentYear + "-04-05", currentYear + "-04-06", "Family Medical Urgent Care", "hr.manager@ep-systems.com"
                );
                // Ali Raza: 1 Pending Field Duty Leave
                if (fieldPolId != null) {
                    jdbcTemplate.update(
                            "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status) VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'PENDING')",
                            UUID.randomUUID().toString(), aliRazaId, fieldPolId, currentYear + "-10-20", currentYear + "-10-21", "Weekend Merchant Acquisition Compensatory Leave"
                    );
                }
            }

            if (sickPolId != null && zainabId != null) {
                // Zainab Ali: 1 Approved Sick Leave (1 day deducted)
                jdbcTemplate.update(
                        "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status, approved_by) VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'APPROVED', ?)",
                        UUID.randomUUID().toString(), zainabId, sickPolId, currentYear + "-02-14", currentYear + "-02-14", "Dental Surgery & Recovery", "hr.chro@ep-systems.com"
                );
            }

            if (annualPolId != null && usmanGhaniId != null) {
                // Usman Ghani: 1 Rejected Leave
                jdbcTemplate.update(
                        "INSERT INTO leave_request (id, employee_id, leave_policy_id, start_date, end_date, reason, status, approved_by) VALUES (?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, 'REJECTED', ?)",
                        UUID.randomUUID().toString(), usmanGhaniId, annualPolId, currentYear + "-06-01", currentYear + "-06-05", "Personal Break during Audit Peak", "finance.admin@ep-systems.com"
                );
            }
        } catch (Exception e) {
            log.warn("Leave requests seeding note: {}", e.getMessage());
        }

        log.info("✅ E-Processing Systems (OneLoad) Tenant Seeding Completed Successfully!");
    }

    private void logSeederCredentialSummary() {
        log.info("========================================================================");
        log.info("🔑 E-PROCESSING SYSTEMS (ONELOAD) ACTUAL CORPORATE CREDENTIAL MATRIX:");
        log.info("========================================================================");
        log.info(" 🛡️ PLATFORM PORTAL (Base Domain / hrm.com):");
        log.info("    - SYSTEM ADMIN     : admin@hrm.com                 / Password: admin123");
        log.info(" 🏢 WORKSPACE PORTAL (Subdomain: 'awais.hrm.com'):");
        log.info("    1. FOUNDER & CEO   : ceo@ep-systems.com            / Password: password123 (Muhammad Yar Hiraj)");
        log.info("    2. CHAIRMAN        : chairman@ep-systems.com       / Password: password123 (Aezaz Hussain)");
        log.info("    3. BOARD DIRECTOR  : board.asif@ep-systems.com     / Password: password123 (Asif Peer)");
        log.info("    4. GROUP CHRO      : hr.chro@ep-systems.com        / Password: password123 (Toima Asghar)");
        log.info("    5. HR MANAGER      : hr.manager@ep-systems.com     / Password: password123 (Zainab Ali)");
        log.info("    6. RECRUITER       : recruiter@ep-systems.com      / Password: password123 (Ayesha Malik)");
        log.info("    7. ENG DIRECTOR    : eng.director@ep-systems.com   / Password: password123 (Asad Mahmood)");
        log.info("    8. PRINCIPAL ARCH  : architect@ep-systems.com      / Password: password123 (Kamran Baig)");
        log.info("    9. LEAD DEV        : lead.dev@ep-systems.com       / Password: password123 (Hamza Riaz)");
        log.info("   10. DEVOPS LEAD     : devops.lead@ep-systems.com    / Password: password123 (Bilal Ahmed)");
        log.info("   11. QA LEAD         : qa.lead@ep-systems.com        / Password: password123 (Sania Mirza)");
        log.info("   12. PRODUCT LEAD    : product.lead@ep-systems.com   / Password: password123 (Omer Farooq)");
        log.info("   13. CFO             : finance.admin@ep-systems.com  / Password: password123 (Tariq Mahmood)");
        log.info("   14. TREASURY MGR    : finance.analyst@ep-systems.com/ Password: password123 (Usman Ghani)");
        log.info("   15. COMPLIANCE AUD  : auditor@ep-systems.com        / Password: password123 (Mubashir Hassan)");
        log.info("   16. SALES HEAD      : line.manager@ep-systems.com   / Password: password123 (Usman Khan)");
        log.info("   17. TERRITORY CENTRAL: territory.central@ep-systems.com / Password: password123 (Saad Siddiqui)");
        log.info("   18. FIELD OFFICER   : employee.john@ep-systems.com  / Password: password123 (Ali Raza)");
        log.info("   19. SUPPORT REP     : employee.jane@ep-systems.com  / Password: password123 (Sana Sheikh)");
        log.info("========================================================================");
    }
}
