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
        com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.setCurrentTenant("MASTER");
        try {
            log.info("========================================================================");
            log.info("🚀 EXECUTING ENTERPRISE TENANT & MULTI-ROLE DATA SEEDER...");
            log.info("========================================================================");

            String defaultSubdomain = "awais";
            String defaultCompanyName = "Acme HR Enterprise";
            String defaultAdminEmail = "tenant.admin@awais.com";

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
                log.info("Provisioning physical database & schema for master tenant subdomain: {}", defaultSubdomain);
                TenantRegisterRequestDTO request = new TenantRegisterRequestDTO();
                request.setCompanyName(defaultCompanyName);
                request.setSubdomain(defaultSubdomain);
                request.setAdminEmail(defaultAdminEmail);
                request.setAdminPassword("admin123");
                request.setLogoUrl("https://via.placeholder.com/150?text=Acme+HR");
                request.setPrimaryColor("#6366f1");
                request.setSecondaryColor("#10b981");

                try {
                    tenant = tenantService.registerNewTenant(request);
                } catch (Exception e) {
                    log.warn("Notice during tenant registration: {}", e.getMessage(), e);
                    com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.setCurrentTenant("MASTER");
                    tenant = tenantRepository.findBySubdomain(defaultSubdomain).orElse(null);
                }
            }

            if (tenant != null) {
                DataSource tenantDataSource = tenantService.getTenantDataSource(tenant.getId());
                if (tenantDataSource != null) {
                    // Ensure Platform Super Admin admin@awais.com is NEVER in tenant Employee Directory
                    try {
                        org.springframework.jdbc.core.JdbcTemplate tJdbc = new org.springframework.jdbc.core.JdbcTemplate(tenantDataSource);
                        tJdbc.update("DELETE FROM employee WHERE email = 'admin@awais.com'");
                    } catch (Exception e) {
                        log.warn("Could not clean up super admin from tenant employee directory: {}", e.getMessage());
                    }
                    seedComprehensiveTenantData(tenantDataSource, defaultAdminEmail);
                }
            }

            logSeederCredentialSummary();
        } finally {
            com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.clear();
        }
    }

    private void seedComprehensiveTenantData(DataSource tenantDataSource, String adminEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(tenantDataSource);

        log.info("Seeding security permissions and multi-role employee catalog...");

        // 1. Seed Core Permissions
        Map<String, String> permissions = Map.of(
                "corehr:employee:read", "Read access to employee profiles and directories",
                "corehr:employee:write", "Write & update access to employee records",
                "corehr:org:write", "Manage organization structure and tree nodes",
                "corehr:settings:write", "Modify white-label tenant branding configurations",
                "payroll:process", "Execute payroll calculations and bank export files",
                "attendance:manage", "Manage employee attendance logs and shifts",
                "recruitment:manage", "Manage ATS job requisitions and candidate applications",
                "audit:read", "View security audit ledger logs"
        );

        Map<String, String> permIdMap = new HashMap<>();
        for (Map.Entry<String, String> entry : permissions.entrySet()) {
            String permId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                    permId, entry.getKey(), entry.getValue()
            );
            List<String> foundMap = jdbcTemplate.queryForList(
                    "SELECT id FROM permission WHERE name = ?", String.class, entry.getKey());
            if (!foundMap.isEmpty()) {
                permIdMap.put(entry.getKey(), foundMap.get(0));
            }
        }

        // 2. Seed All Standard Roles
        Map<String, String> roles = Map.of(
                "SYSTEM_ADMIN", "Full system platform administrator",
                "TENANT_ADMIN", "Organization workspace administrator",
                "HR_MANAGER", "HR department manager & workforce controller",
                "LINE_MANAGER", "Team supervisor and leave/attendance approver",
                "FINANCE_ADMIN", "Payroll accountant & finance operations manager",
                "RECRUITER", "Talent acquisition specialist",
                "AUDITOR", "Compliance auditor with read-only ledger access",
                "EMPLOYEE", "Standard employee self-service user"
        );

        Map<String, String> roleIdMap = new HashMap<>();
        for (Map.Entry<String, String> entry : roles.entrySet()) {
            String roleId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO role (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                    roleId, entry.getKey(), entry.getValue()
            );
            List<String> foundRole = jdbcTemplate.queryForList(
                    "SELECT id FROM role WHERE name = ?", String.class, entry.getKey());
            if (!foundRole.isEmpty()) {
                roleIdMap.put(entry.getKey(), foundRole.get(0));
            }
        }

        // Bind Permissions to Roles
        for (String roleName : roleIdMap.keySet()) {
            String rId = roleIdMap.get(roleName);
            for (String pId : permIdMap.values()) {
                jdbcTemplate.update(
                        "INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                        rId, pId
                );
            }
        }

        // 3. Seed Default Vacation & Leave Types
        log.info("Seeding default Vacation & Leave Types...");
        List<Object[]> leaveTypes = List.of(
                new Object[]{UUID.randomUUID().toString(), "Annual Vacation", 20, "Paid standard annual vacation days"},
                new Object[]{UUID.randomUUID().toString(), "Casual Leave", 10, "Short-notice casual leave allowance"},
                new Object[]{UUID.randomUUID().toString(), "Sick Leave", 12, "Medical emergency paid leave"},
                new Object[]{UUID.randomUUID().toString(), "Maternity Leave", 90, "Maternal care paid leave allocation"},
                new Object[]{UUID.randomUUID().toString(), "Paternity Leave", 14, "Paternal support leave allocation"},
                new Object[]{UUID.randomUUID().toString(), "Unpaid Leave / LOP", 30, "Loss of Pay uncompensated leave"},
                new Object[]{UUID.randomUUID().toString(), "Bereavement Leave", 5, "Compassionate bereavement allowance"}
        );

        for (Object[] lt : leaveTypes) {
            jdbcTemplate.update(
                    "INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
                    lt[0], lt[1], lt[2], lt[3]
            );
        }

        // 4. Seed Multi-Role Employee Users with Login Passwords
        log.info("Seeding multi-role test employee logins...");

        String defaultHashedPassword = passwordEncoder.encode("password123");

        List<Object[]> seedUsers = List.of(
                new Object[]{"EMP-001", "Tenant", "Administrator", "tenant.admin@awais.com", defaultHashedPassword, "TENANT_ADMIN"},
                new Object[]{"EMP-002", "Sarah", "Connor (HR Mgr)", "hr.manager@awais.com", defaultHashedPassword, "HR_MANAGER"},
                new Object[]{"EMP-003", "Michael", "Scott (Line Mgr)", "line.manager@awais.com", defaultHashedPassword, "LINE_MANAGER"},
                new Object[]{"EMP-004", "Oscar", "Martinez (Finance)", "finance.admin@awais.com", defaultHashedPassword, "FINANCE_ADMIN"},
                new Object[]{"EMP-005", "Pam", "Beesly (Recruiter)", "recruiter@awais.com", defaultHashedPassword, "RECRUITER"},
                new Object[]{"EMP-006", "Angela", "Martin (Auditor)", "auditor@awais.com", defaultHashedPassword, "AUDITOR"},
                new Object[]{"EMP-007", "John", "Doe (Employee)", "employee.john@awais.com", defaultHashedPassword, "EMPLOYEE"},
                new Object[]{"EMP-008", "Jane", "Smith (Employee)", "employee.jane@awais.com", defaultHashedPassword, "EMPLOYEE"}
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
                        "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                        empId, targetRoleId
                );
            }
        }

        // 5. Seed Departments / Org Hierarchy
        log.info("Seeding organization units & departments...");
        
        // Clear existing org units to avoid duplicate records and build a clean tree structure
        jdbcTemplate.update("DELETE FROM org_unit");

        // Seed Legal Entity (Root Node)
        String legalEntityId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'LEGAL_ENTITY', NULL)", 
                legalEntityId, "Acme Corp Legal Entity");

        // Seed First Level of Departments under Legal Entity
        String execId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                execId, "Executive Leadership", legalEntityId);

        String financeId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'COST_CENTER', ?)", 
                financeId, "Finance & Accounting", legalEntityId);

        String salesId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                salesId, "Sales & Marketing", legalEntityId);

        // Seed Second Level under Executive Leadership
        String engId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                engId, "Engineering", execId);

        String hrId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'DEPARTMENT', ?)", 
                hrId, "Human Resources", execId);

        // Seed Teams under Engineering
        String devId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'TEAM', ?)", 
                devId, "Core Platform Team", engId);

        // Seed Teams under Human Resources
        String taId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO org_unit (id, name, type, parent_id) VALUES (?, ?, 'TEAM', ?)", 
                taId, "Talent Acquisition Team", hrId);

        // 6. Seed Sample Shift Schedules
        jdbcTemplate.update(
                "INSERT INTO shift_schedule (id, name, start_time, end_time) VALUES (?, 'Standard General Shift', '09:00:00', '17:00:00') ON CONFLICT DO NOTHING",
                UUID.randomUUID().toString()
        );

        // 7. Seed Sample ATS Jobs
        jdbcTemplate.update(
                "INSERT INTO job_requisition (id, title, description, status, openings, salary_range) VALUES (?, 'Full Stack Staff Engineer', 'Lead dynamic multi-tenant SaaS architecture.', 'OPEN', 2, '$120k - $160k') ON CONFLICT DO NOTHING",
                UUID.randomUUID().toString()
        );

        log.info("✅ Comprehensive Tenant Seed Completed Successfully!");
    }

    private void logSeederCredentialSummary() {
        log.info("========================================================================");
        log.info("🔑 PLATFORM & TENANT LOGIN CREDENTIAL MATRIX:");
        log.info("========================================================================");
        log.info(" 🛡️ PLATFORM PORTAL (Base Domain / hrm.com):");
        log.info("    - SYSTEM ADMIN     : admin@hrm.com           / Password: admin123");
        log.info(" 🏢 WORKSPACE PORTAL (Subdomain: 'awais.hrm.com'):");
        log.info("    1. TENANT ADMIN    : tenant.admin@awais.com  / Password: password123");
        log.info("    2. HR MANAGER      : hr.manager@awais.com    / Password: password123");
        log.info("    3. LINE MANAGER    : line.manager@awais.com  / Password: password123");
        log.info("    4. FINANCE ADMIN   : finance.admin@awais.com / Password: password123");
        log.info("    5. RECRUITER       : recruiter@awais.com     / Password: password123");
        log.info("    6. AUDITOR         : auditor@awais.com       / Password: password123");
        log.info("    7. EMPLOYEE (JOHN) : employee.john@awais.com / Password: password123");
        log.info("    8. EMPLOYEE (JANE) : employee.jane@awais.com / Password: password123");
        log.info("========================================================================");
    }
}
