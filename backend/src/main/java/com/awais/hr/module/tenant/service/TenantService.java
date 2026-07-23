package com.awais.hr.module.tenant.service;

import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.repository.TenantRepository;
import com.awais.hr.context.TenantRoutingDataSource;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantRoutingDataSource routingDataSource;
    private final DataSource masterDataSource;
    private final PasswordEncoder passwordEncoder;

    private final Map<Object, Object> tenantDataSources = new ConcurrentHashMap<>();

    @org.springframework.beans.factory.annotation.Value("${tenant.datasource.url-prefix}")
    private String tenantDbUrlPrefix;

    @org.springframework.beans.factory.annotation.Value("${tenant.datasource.username}")
    private String tenantDbUsername;

    @org.springframework.beans.factory.annotation.Value("${tenant.datasource.password}")
    private String tenantDbPassword;

    @PostConstruct
    public void initializeTenants() {
        log.info("Initializing active tenant connection pools on startup...");
        List<Tenant> tenants = tenantRepository.findAll();
        for (Tenant tenant : tenants) {
            if ("ACTIVE".equalsIgnoreCase(tenant.getStatus())) {
                try {
                    registerTenantDataSource(tenant);
                } catch (Exception e) {
                    log.error("Failed to initialize connection pool for tenant: {}", tenant.getId(), e);
                }
            }
        }
    }

    public synchronized void registerTenantDataSource(Tenant tenant) {
        if (tenantDataSources.containsKey(tenant.getId())) {
            return;
        }

        HikariDataSource ds = DataSourceBuilder.create()
                .url(tenant.getDbUrl())
                .username(tenant.getDbUsername())
                .password(tenant.getDbPassword())
                .driverClassName("org.postgresql.Driver")
                .type(HikariDataSource.class)
                .build();

        // Tune Hikari pool specifically for tenant isolation
        ds.setPoolName("HikariPool-Tenant-" + tenant.getId());
        ds.setMaximumPoolSize(10);
        ds.setMinimumIdle(2);
        ds.setIdleTimeout(300000);

        tenantDataSources.put(tenant.getId(), ds);
        
        // Refresh routing datasource configurations dynamically
        Map<Object, Object> updatedDataSources = new HashMap<>(tenantDataSources);
        updatedDataSources.put("MASTER", masterDataSource);
        
        routingDataSource.setTargetDataSources(updatedDataSources);
        routingDataSource.afterPropertiesSet();
        
        log.info("Successfully registered dynamic connection pool for tenant: {}", tenant.getId());
        
        // Ensure tenant schema is up-to-date with migrations (such as V11, V12)
        try {
            runFlywayMigrations(ds);
        } catch (Exception e) {
            log.error("Failed to run dynamic Flyway migrations against tenant database: {}", tenant.getId(), e);
        }
    }

    public Tenant registerNewTenant(String companyName, String subdomain, String adminEmail) {
        log.info("Registering new tenant company: {} with subdomain: {}", companyName, subdomain);
        
        if (subdomain != null) {
            subdomain = subdomain.toLowerCase().trim();
        }
        
        // 1. Backend validation checks
        if (subdomain == null || !subdomain.matches("^[a-z0-9-]+$")) {
            throw new com.awais.hr.exception.InvalidTenantException(
                "Subdomain must contain only lowercase alphanumeric characters and hyphens"
            );
        }

        // Strict reserved keywords blacklist
        java.util.Set<String> reservedSubdomains = java.util.Set.of(
            "api", "admin", "www", "master", "test", "app", "mail", "blog", "dev", "staging", "portal", "billing", "root", "system"
        );
        if (reservedSubdomains.contains(subdomain.toLowerCase())) {
            throw new com.awais.hr.exception.InvalidTenantException(
                "Subdomain '" + subdomain + "' is a system reserved path and cannot be registered"
            );
        }
        
        if (tenantRepository.findBySubdomain(subdomain).isPresent()) {
            throw new com.awais.hr.exception.TenantAlreadyExistsException(
                "Subdomain '" + subdomain + "' is already registered on the platform"
            );
        }

        if (tenantRepository.findByName(companyName).isPresent()) {
            throw new com.awais.hr.exception.TenantAlreadyExistsException(
                "Company name '" + companyName + "' is already registered on the platform"
            );
        }

        // Check if admin email already registered in any active tenant database
        for (Map.Entry<Object, Object> entry : tenantDataSources.entrySet()) {
            try {
                DataSource tenantDs = (DataSource) entry.getValue();
                JdbcTemplate tenantJdbc = new JdbcTemplate(tenantDs);
                Integer count = tenantJdbc.queryForObject(
                        "SELECT COUNT(1) FROM employee WHERE email = ?",
                        Integer.class, adminEmail
                );
                if (count != null && count > 0) {
                    throw new com.awais.hr.exception.TenantAlreadyExistsException(
                        "The administrator email '" + adminEmail + "' is already registered on the platform"
                    );
                }
            } catch (com.awais.hr.exception.TenantAlreadyExistsException taee) {
                throw taee;
            } catch (Exception e) {
                // Ignore if tables are not initialized
            }
        }
        
        String tenantId = UUID.randomUUID().toString();
        String dbName = "awais_hr_tenant_" + subdomain;
        
        createPhysicalDatabase(dbName);
        
        String dbUrl = tenantDbUrlPrefix + dbName;
        Tenant tenant = Tenant.builder()
                .id(tenantId)
                .name(companyName)
                .subdomain(subdomain)
                .dbUrl(dbUrl)
                .dbUsername(tenantDbUsername)
                .dbPassword(tenantDbPassword)
                .primaryColor("#6366f1")
                .secondaryColor("#a855f7")
                .status("ACTIVE")
                .build();
        
        tenant = tenantRepository.save(tenant);
        
        // Trigger Let's Encrypt SSL Domain Setup Mock
        triggerSslProvisioning(tenant);
        
        // 4. Register the connection pool dynamically in the active routing registry
        registerTenantDataSource(tenant);
        
        // 5. Run Flyway schema migrations on the new database context
        DataSource tenantDs = (DataSource) tenantDataSources.get(tenantId);
        runFlywayMigrations(tenantDs);
        
        // 6. Seed the initial admin user profile and default security permissions
        seedTenantMetadata(tenantDs, adminEmail);
        
        return tenant;
    }

    private void triggerSslProvisioning(Tenant tenant) {
        log.info("[SSL Provisioning] Triggering Let's Encrypt certificate challenge request for subdomain: {}.localhost", tenant.getSubdomain());
        if (tenant.getCustomDomain() != null && !tenant.getCustomDomain().trim().isEmpty()) {
            log.info("[SSL Provisioning] Requesting CNAME Let's Encrypt challenge validation for custom domain: {}", tenant.getCustomDomain());
        }
    }

    private void createPhysicalDatabase(String dbName) {
        log.info("Creating physical PostgreSQL database: {}", dbName);
        JdbcTemplate jdbcTemplate = new JdbcTemplate(masterDataSource);
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ?)",
                Boolean.class, dbName
        );
        if (exists != null && exists) {
            log.info("Database '{}' already exists. Reusing existing database.", dbName);
            return;
        }
        jdbcTemplate.execute("CREATE DATABASE \"" + dbName + "\"");
    }

    private void runFlywayMigrations(DataSource tenantDataSource) {
        log.info("Running dynamic Flyway migrations against tenant database context...");
        Flyway flyway = Flyway.configure()
                .dataSource(tenantDataSource)
                .locations("classpath:db/migration/tenant/core")
                .cleanDisabled(true)
                .load();
        flyway.migrate();
    }

    private void seedTenantMetadata(DataSource tenantDataSource, String adminEmail) {
        log.info("Seeding metadata defaults (permissions, admin user) to tenant database...");
        JdbcTemplate jdbcTemplate = new JdbcTemplate(tenantDataSource);
        
        // Skip seeding if admin employee is already populated
        Boolean alreadySeeded = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee WHERE email = ?)",
                Boolean.class, adminEmail
        );
        if (alreadySeeded != null && alreadySeeded) {
            log.info("Tenant database metadata for admin '{}' is already seeded. Skipping seed execution.", adminEmail);
            return;
        }
        
        String p1 = UUID.randomUUID().toString();
        String p2 = UUID.randomUUID().toString();
        String p3 = UUID.randomUUID().toString();
        String p4 = UUID.randomUUID().toString();
        String roleId = UUID.randomUUID().toString();
        String employeeId = UUID.randomUUID().toString();
        
        // Insert core dynamic permissions
        jdbcTemplate.update(
                "INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                p1, "corehr:employee:read", "Read access to employee profiles"
        );
        jdbcTemplate.update(
                "INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                p2, "corehr:employee:write", "Write access to employee profiles"
        );
        jdbcTemplate.update(
                "INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                p3, "corehr:org:write", "Manage organization structure and tree nodes"
        );
        jdbcTemplate.update(
                "INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                p4, "corehr:settings:write", "Modify white-label tenant branding configurations"
        );
        
        // Insert default System Admin role
        jdbcTemplate.update(
                "INSERT INTO role (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                roleId, "SYSTEM_ADMIN", "Full access administrator"
        );
        
        List<String> existingRoles = jdbcTemplate.queryForList("SELECT id FROM role WHERE name = 'SYSTEM_ADMIN'", String.class);
        if (!existingRoles.isEmpty()) {
            roleId = existingRoles.get(0);
        }
        
        // Bind role to permissions
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", roleId, p1);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", roleId, p2);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", roleId, p3);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", roleId, p4);

        // Seed additional standard organizational roles
        String empRoleId = UUID.randomUUID().toString();
        String mgrRoleId = UUID.randomUUID().toString();
        String hrManagerRoleId = UUID.randomUUID().toString();

        jdbcTemplate.update("INSERT INTO role (id, name, description) VALUES (?, ?, ?)",
                empRoleId, "EMPLOYEE", "Standard employee self-service access");
        jdbcTemplate.update("INSERT INTO role (id, name, description) VALUES (?, ?, ?)",
                mgrRoleId, "MANAGER", "Department supervisor access and approvals");
        jdbcTemplate.update("INSERT INTO role (id, name, description) VALUES (?, ?, ?)",
                hrManagerRoleId, "HR_MANAGER", "Core HR staff and operational management");

        // Map permissions to standard roles
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)", empRoleId, p1);
        
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)", mgrRoleId, p1);
        
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)", hrManagerRoleId, p1);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)", hrManagerRoleId, p2);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)", hrManagerRoleId, p3);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)", hrManagerRoleId, p4);
        
        // Hash initial admin password using BCrypt
        String hashedPassword = passwordEncoder.encode("admin123");

        // Create initial employee profile with hashed password
        jdbcTemplate.update(
                "INSERT INTO employee (id, employee_code, first_name, last_name, email, password, status, joining_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)",
                employeeId, "EMP-ADMIN-001", "Tenant", "Administrator", adminEmail, hashedPassword, "ACTIVE"
        );
        
        // Map employee to admin role
        jdbcTemplate.update(
                "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?)",
                employeeId, roleId
        );


        // Seed default Leave Policies
        String annualLeaveId = UUID.randomUUID().toString();
        String sickLeaveId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, ?, ?, ?)",
                annualLeaveId, "Annual Vacation", 20, "Standard annual paid vacation allocation");
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, ?, ?, ?)",
                sickLeaveId, "Sick Leave", 10, "Paid medical emergency allocations");

        // Seed default Job Requisition
        String job1 = UUID.randomUUID().toString();
        String job2 = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO job_requisition (id, title, description, status, openings, salary_range) VALUES (?, ?, ?, ?, ?, ?)",
                job1, "Senior React Developer", "Work on premium dashboard layout workflows.", "OPEN", 2, "$80k - $120k");
        jdbcTemplate.update("INSERT INTO job_requisition (id, title, description, status, openings, salary_range) VALUES (?, ?, ?, ?, ?, ?)",
                job2, "SRE Cloud Architect", "Build dynamic database context isolation layers.", "OPEN", 1, "$100k - $140k");

        // Seed mock ATS candidates
        jdbcTemplate.update("INSERT INTO candidate_application (id, job_id, first_name, last_name, email, status_stage) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), job1, "John", "Doe", "john.doe@gmail.com", "APPLIED");
        jdbcTemplate.update("INSERT INTO candidate_application (id, job_id, first_name, last_name, email, status_stage) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), job1, "Jane", "Miller", "jane.miller@yahoo.com", "INTERVIEW");
        jdbcTemplate.update("INSERT INTO candidate_application (id, job_id, first_name, last_name, email, status_stage) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), job2, "David", "Clark", "david.clark@outlook.com", "SCREEN");

        // Seed Payroll salary structures
        jdbcTemplate.update("INSERT INTO salary_structure (id, employee_id, basic_salary, allowance, deductions) VALUES (?, ?, 7500.00, 1200.00, 450.00)",
                UUID.randomUUID().toString(), employeeId);

        // Seed Shift schedule templates
        String shiftId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO shift_schedule (id, name, start_time, end_time) VALUES (?, 'Standard Day Roster', '09:00:00', '17:00:00')",
                shiftId);
        jdbcTemplate.update("INSERT INTO employee_shift (employee_id, shift_id, work_date) VALUES (?, ?, CURRENT_DATE)",
                employeeId, shiftId);

        // Seed Performance Goals
        jdbcTemplate.update("INSERT INTO performance_goal (id, employee_id, title, target_value, current_value, status) VALUES (?, ?, 'Achieve Platform Code Review Coverage', 100, 75, 'IN_PROGRESS')",
                UUID.randomUUID().toString(), employeeId);

        // Seed Learning Courses
        String courseId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO course (id, title, description, category) VALUES (?, 'Security Controls & Access Protocols', 'Handbook mapping best security checks.', 'Compliance')",
                courseId);
        jdbcTemplate.update("INSERT INTO course_enrollment (employee_id, course_id, status) VALUES (?, ?, 'ENROLLED')",
                employeeId, courseId);

        // Seed Projects
        jdbcTemplate.update("INSERT INTO project (id, name, description) VALUES (?, 'SaaS Enterprise Suite', 'Deploy core features and isolated databases')",
                UUID.randomUUID().toString());
    }
}
