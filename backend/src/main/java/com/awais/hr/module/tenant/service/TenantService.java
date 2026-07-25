package com.awais.hr.module.tenant.service;

import com.awais.hr.module.tenant.dto.TenantRegisterRequestDTO;
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

import javax.sql.DataSource;
import java.util.*;
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
        try {
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
        } catch (Exception e) {
            log.warn("Master tenant table not fully ready during startup initialization: {}. DataSeeder will complete setup.", e.getMessage());
        }
    }

    public DataSource getTenantDataSource(String tenantId) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            return null;
        }
        String key = tenantId.trim().toLowerCase();
        DataSource ds = (DataSource) tenantDataSources.get(key);
        if (ds == null) {
            ds = (DataSource) tenantDataSources.get(tenantId);
        }
        if (ds == null) {
            // Dynamically load from database repository
            Optional<Tenant> tenantOpt = tenantRepository.findById(tenantId);
            if (tenantOpt.isEmpty()) {
                tenantOpt = tenantRepository.findBySubdomain(key);
            }
            if (tenantOpt.isPresent()) {
                registerTenantDataSource(tenantOpt.get());
                ds = (DataSource) tenantDataSources.get(tenantOpt.get().getId());
            }
        }
        return ds;
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
        if (tenant.getSubdomain() != null) {
            tenantDataSources.put(tenant.getSubdomain().toLowerCase().trim(), ds);
        }
        
        // Refresh routing datasource configurations dynamically
        Map<Object, Object> updatedDataSources = new HashMap<>(tenantDataSources);
        updatedDataSources.put("MASTER", masterDataSource);
        
        routingDataSource.setTargetDataSources(updatedDataSources);
        routingDataSource.afterPropertiesSet();
        
        log.info("Successfully registered dynamic connection pool for tenant: {}", tenant.getId());
        
        // Ensure tenant schema is up-to-date with migrations
        try {
            runFlywayMigrations(ds);
        } catch (Exception e) {
            log.error("Failed to run dynamic Flyway migrations against tenant database: {}", tenant.getId(), e);
        }
    }

    public Tenant registerNewTenant(String companyName, String subdomain, String adminEmail) {
        TenantRegisterRequestDTO dto = new TenantRegisterRequestDTO();
        dto.setCompanyName(companyName);
        dto.setSubdomain(subdomain);
        dto.setAdminEmail(adminEmail);
        return registerNewTenant(dto);
    }

    public Tenant registerNewTenant(TenantRegisterRequestDTO request) {
        String companyName = request.getCompanyName();
        String subdomain = request.getSubdomain();
        String adminEmail = request.getAdminEmail();

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
        Set<String> reservedSubdomains = Set.of(
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
        String primaryColor = (request.getPrimaryColor() != null && !request.getPrimaryColor().isBlank()) ? request.getPrimaryColor() : "#6366f1";
        String secondaryColor = (request.getSecondaryColor() != null && !request.getSecondaryColor().isBlank()) ? request.getSecondaryColor() : "#10b981";
        String logoUrl = (request.getLogoUrl() != null && !request.getLogoUrl().isBlank()) ? request.getLogoUrl() : "https://via.placeholder.com/150?text=" + companyName;

        Tenant tenant = Tenant.builder()
                .id(tenantId)
                .name(companyName)
                .subdomain(subdomain)
                .dbUrl(dbUrl)
                .dbUsername(tenantDbUsername)
                .dbPassword(tenantDbPassword)
                .primaryColor(primaryColor)
                .secondaryColor(secondaryColor)
                .logoUrl(logoUrl)
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
        
        // 6. Seed initial admin user profile & default security permissions & vacation types
        String adminPassword = (request.getAdminPassword() != null && !request.getAdminPassword().isBlank()) ? request.getAdminPassword() : "admin123";
        seedTenantMetadata(tenantDs, adminEmail, adminPassword);
        
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
        flyway.repair();
        flyway.migrate();
    }

    private void seedTenantMetadata(DataSource tenantDataSource, String adminEmail) {
        seedTenantMetadata(tenantDataSource, adminEmail, "admin123");
    }

    private void seedTenantMetadata(DataSource tenantDataSource, String adminEmail, String rawPassword) {
        log.info("Seeding metadata defaults (permissions, roles, vacation types, admin user) to tenant database...");
        JdbcTemplate jdbcTemplate = new JdbcTemplate(tenantDataSource);
        
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
        
        jdbcTemplate.update("INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING", p1, "corehr:employee:read", "Read access to employee profiles");
        jdbcTemplate.update("INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING", p2, "corehr:employee:write", "Write access to employee profiles");
        jdbcTemplate.update("INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING", p3, "corehr:org:write", "Manage organization structure and tree nodes");
        jdbcTemplate.update("INSERT INTO permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING", p4, "corehr:settings:write", "Modify white-label tenant branding configurations");
        
        p1 = fetchPermissionId(jdbcTemplate, "corehr:employee:read", p1);
        p2 = fetchPermissionId(jdbcTemplate, "corehr:employee:write", p2);
        p3 = fetchPermissionId(jdbcTemplate, "corehr:org:write", p3);
        p4 = fetchPermissionId(jdbcTemplate, "corehr:settings:write", p4);
        
        String tenantAdminRoleId = UUID.randomUUID().toString();
        jdbcTemplate.update("INSERT INTO role (id, name, description) VALUES (?, 'TENANT_ADMIN', 'Tenant organization workspace administrator') ON CONFLICT DO NOTHING", tenantAdminRoleId);
        List<String> existingRoles = jdbcTemplate.queryForList("SELECT id FROM role WHERE name = 'TENANT_ADMIN'", String.class);
        if (!existingRoles.isEmpty()) tenantAdminRoleId = existingRoles.get(0);
        
        // Seed default auxiliary roles into tenant schema for employee onboarding
        jdbcTemplate.update("INSERT INTO role (id, name, description) VALUES (?, 'HR_MANAGER', 'Human resource department manager') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        jdbcTemplate.update("INSERT INTO role (id, name, description) VALUES (?, 'EMPLOYEE', 'Standard employee self-service user') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        jdbcTemplate.update("INSERT INTO role (id, name, description) VALUES (?, 'RECRUITER', 'Talent acquisition recruiter') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", tenantAdminRoleId, p1);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", tenantAdminRoleId, p2);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", tenantAdminRoleId, p3);
        jdbcTemplate.update("INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", tenantAdminRoleId, p4);

        // Seed default Leave Policies (Vacation Types)
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, 'Annual Vacation', 20, 'Standard annual paid vacation allocation') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, 'Casual Leave', 10, 'Short-notice casual leave allowance') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, 'Sick Leave', 12, 'Paid medical emergency allocations') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, 'Maternity Leave', 90, 'Maternal care paid leave allocation') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, 'Paternity Leave', 14, 'Paternal support leave allocation') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());
        jdbcTemplate.update("INSERT INTO leave_policy (id, name, allowance, description) VALUES (?, 'Unpaid Leave / LOP', 30, 'Loss of Pay uncompensated leave') ON CONFLICT DO NOTHING", UUID.randomUUID().toString());

        String hashedPassword = passwordEncoder.encode(rawPassword);

        jdbcTemplate.update(
                "INSERT INTO employee (id, employee_code, first_name, last_name, email, password, status, joining_date) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_DATE) ON CONFLICT DO NOTHING",
                employeeId, "EMP-ADMIN-001", "Tenant", "Administrator", adminEmail, hashedPassword
        );
        
        List<String> empIds = jdbcTemplate.queryForList("SELECT id FROM employee WHERE email = ?", String.class, adminEmail);
        if (!empIds.isEmpty()) {
            employeeId = empIds.get(0);
        }

        jdbcTemplate.update(
                "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                employeeId, tenantAdminRoleId
        );
    }

    private String fetchPermissionId(JdbcTemplate jdbcTemplate, String permName, String fallbackId) {
        List<String> ids = jdbcTemplate.queryForList("SELECT id FROM permission WHERE name = ?", String.class, permName);
        return ids.isEmpty() ? fallbackId : ids.get(0);
    }
}
