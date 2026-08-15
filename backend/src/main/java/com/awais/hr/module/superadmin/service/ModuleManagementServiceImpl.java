package com.awais.hr.module.superadmin.service;

import com.awais.hr.context.TenantContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Service
@Transactional
public class ModuleManagementServiceImpl implements ModuleManagementService {

    private static final Logger log = LoggerFactory.getLogger(ModuleManagementServiceImpl.class);
    private final DataSource dataSource;

    // Local high-speed cache for feature flags
    private final Map<String, Boolean> moduleCache = new ConcurrentHashMap<>();

    public ModuleManagementServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private <T> T executeInMasterContext(Supplier<T> action) {
        String previousTenant = TenantContextHolder.getCurrentTenant();
        try {
            TenantContextHolder.setCurrentTenant("MASTER");
            ensureMasterTablesExist();
            return action.get();
        } finally {
            if (previousTenant != null) {
                TenantContextHolder.setCurrentTenant(previousTenant);
            } else {
                TenantContextHolder.clear();
            }
        }
    }

    private void ensureMasterTablesExist() {
        try {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            jdbc.execute(
                    "CREATE TABLE IF NOT EXISTS platform_module (" +
                    "module_key VARCHAR(100) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "category VARCHAR(50) NOT NULL, " +
                    "description TEXT, " +
                    "is_globally_enabled BOOLEAN DEFAULT TRUE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")"
            );

            jdbc.execute(
                    "CREATE TABLE IF NOT EXISTS tenant_module_override (" +
                    "tenant_id VARCHAR(100) NOT NULL, " +
                    "module_key VARCHAR(100) NOT NULL, " +
                    "is_enabled BOOLEAN NOT NULL, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "PRIMARY KEY (tenant_id, module_key)" +
                    ")"
            );

            // Seed default platform modules if empty
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM platform_module", Integer.class);
            if (count != null && count == 0) {
                String[][] defaultModules = {
                        {"COREHR", "Core HR & Employee Directory", "CORE", "Employee records, org chart, and company profile"},
                        {"RECRUITMENT", "Recruitment & ATS", "RECRUITMENT", "Applicant tracking system, job requisitions, and interviews"},
                        {"PAYROLL", "Payroll Engine", "FINANCE", "Salary structures, payslips, and tax calculations"},
                        {"ATTENDANCE", "Time & Attendance", "WORKFORCE", "Clock-in tracking, shifts, and leave management"},
                        {"PERFORMANCE", "Performance Appraisals", "TALENT", "Goal setting, reviews, and 360 feedback"},
                        {"CROP_YIELD", "Agritech & Crop Yield", "ENTERPRISE", "Agricultural workforce and yield tracking"}
                };

                for (String[] mod : defaultModules) {
                    jdbc.update(
                            "INSERT INTO platform_module (module_key, name, category, description, is_globally_enabled) VALUES (?, ?, ?, ?, true) ON CONFLICT DO NOTHING",
                            mod[0], mod[1], mod[2], mod[3]
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Notice during ensureMasterTablesExist: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllModules() {
        return executeInMasterContext(() -> {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            return jdbc.queryForList("SELECT module_key, name, category, description, is_globally_enabled, created_at, updated_at FROM platform_module ORDER BY category ASC, name ASC");
        });
    }

    @Override
    public Map<String, Object> toggleGlobalModule(String moduleKey, boolean enabled) {
        return executeInMasterContext(() -> {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            String upperKey = moduleKey.toUpperCase();
            int updated = jdbc.update("UPDATE platform_module SET is_globally_enabled = ?, updated_at = NOW() WHERE module_key = ?", enabled, upperKey);
            if (updated == 0) {
                // If not exists, insert it
                jdbc.update("INSERT INTO platform_module (module_key, name, category, description, is_globally_enabled) VALUES (?, ?, 'GENERAL', ?, ?) ON CONFLICT (module_key) DO UPDATE SET is_globally_enabled = EXCLUDED.is_globally_enabled",
                        upperKey, upperKey, "Platform feature module", enabled);
            }
            moduleCache.clear(); // Evict cache
            log.info("Super Admin updated global module status: module={} enabled={}", upperKey, enabled);
            return Map.of("moduleKey", upperKey, "isGloballyEnabled", enabled, "updated", true);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTenantOverrides(String tenantId) {
        return executeInMasterContext(() -> {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            return jdbc.queryForList(
                    "SELECT tmo.module_key, pm.name, pm.category, tmo.is_enabled, tmo.updated_at " +
                    "FROM tenant_module_override tmo " +
                    "JOIN platform_module pm ON tmo.module_key = pm.module_key " +
                    "WHERE tmo.tenant_id = ?", tenantId
            );
        });
    }

    @Override
    public Map<String, Object> setTenantModuleOverride(String tenantId, String moduleKey, Boolean enabled) {
        return executeInMasterContext(() -> {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            String upperKey = moduleKey.toUpperCase();

            // Resolve actual tenant UUID if tenantId is a subdomain or identifier
            String resolvedTenantId = tenantId;
            List<String> realIds = jdbc.queryForList(
                "SELECT id::text FROM tenant WHERE id::text = ? OR subdomain = ?", 
                String.class, tenantId, tenantId
            );
            if (!realIds.isEmpty()) {
                resolvedTenantId = realIds.get(0);
            } else {
                log.warn("Skipping tenant module override: tenant identifier '{}' is not present in tenant table.", tenantId);
                return Map.of("tenantId", tenantId, "moduleKey", upperKey, "skipped", true, "reason", "Non-existent tenant identifier");
            }

            if (enabled == null) {
                // Reset to global default
                jdbc.update("DELETE FROM tenant_module_override WHERE tenant_id = ? AND module_key = ?", resolvedTenantId, upperKey);
                moduleCache.clear();
                return Map.of("tenantId", resolvedTenantId, "moduleKey", upperKey, "overrideCleared", true);
            }

            jdbc.update(
                    "INSERT INTO tenant_module_override (tenant_id, module_key, is_enabled, updated_at) " +
                    "VALUES (?, ?, ?, NOW()) " +
                    "ON CONFLICT (tenant_id, module_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW()",
                    resolvedTenantId, upperKey, enabled
            );
            moduleCache.clear();
            log.info("Super Admin set tenant module override: tenantId={} module={} enabled={}", resolvedTenantId, upperKey, enabled);
            return Map.of("tenantId", resolvedTenantId, "moduleKey", upperKey, "isEnabled", enabled);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isModuleEnabledForTenant(String tenantIdentifier, String moduleKey) {
        if (moduleKey == null || moduleKey.isBlank()) return true;
        String upperKey = moduleKey.toUpperCase();
        String cacheKey = (tenantIdentifier != null ? tenantIdentifier : "GLOBAL") + ":" + upperKey;

        if (moduleCache.containsKey(cacheKey)) {
            return moduleCache.get(cacheKey);
        }

        try {
            return executeInMasterContext(() -> {
                JdbcTemplate jdbc = new JdbcTemplate(dataSource);

                // 1. Check Global Status
                List<Map<String, Object>> globalModule = jdbc.queryForList("SELECT is_globally_enabled FROM platform_module WHERE module_key = ?", upperKey);
                if (globalModule.isEmpty()) {
                    // Unregistered module defaults to true
                    moduleCache.put(cacheKey, true);
                    return true;
                }

                boolean globallyEnabled = Boolean.TRUE.equals(globalModule.get(0).get("is_globally_enabled"));
                if (!globallyEnabled) {
                    moduleCache.put(cacheKey, false);
                    return false;
                }

                if (tenantIdentifier == null || tenantIdentifier.isBlank() || "system".equalsIgnoreCase(tenantIdentifier) || "awais".equalsIgnoreCase(tenantIdentifier) || "MASTER".equalsIgnoreCase(tenantIdentifier)) {
                    moduleCache.put(cacheKey, true);
                    return true;
                }

                // 2. Check Tenant Specific Override (by ID or subdomain)
                try {
                    List<Map<String, Object>> overrides = jdbc.queryForList(
                            "SELECT tmo.is_enabled FROM tenant_module_override tmo " +
                            "LEFT JOIN tenant t ON tmo.tenant_id = t.id " +
                            "WHERE (tmo.tenant_id = ? OR (t.subdomain = ? AND tmo.tenant_id = t.id)) AND tmo.module_key = ?",
                            tenantIdentifier, tenantIdentifier, upperKey
                    );

                    if (!overrides.isEmpty()) {
                        boolean tenantEnabled = Boolean.TRUE.equals(overrides.get(0).get("is_enabled"));
                        moduleCache.put(cacheKey, tenantEnabled);
                        return tenantEnabled;
                    }
                } catch (Exception e) {
                    log.warn("Error checking tenant module override: {}", e.getMessage());
                }

                moduleCache.put(cacheKey, true);
                return true;
            });
        } catch (Exception err) {
            log.warn("Fallback: Exception while checking feature flag for module {}: {}", upperKey, err.getMessage());
            moduleCache.put(cacheKey, true);
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getActiveModulesForTenant(String tenantIdentifier) {
        return executeInMasterContext(() -> {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            List<Map<String, Object>> allModules = jdbc.queryForList("SELECT module_key FROM platform_module WHERE is_globally_enabled = true");

            List<String> activeModules = new ArrayList<>();
            for (Map<String, Object> row : allModules) {
                String moduleKey = (String) row.get("module_key");
                if (isModuleEnabledForTenant(tenantIdentifier, moduleKey)) {
                    activeModules.add(moduleKey);
                }
            }
            return activeModules;
        });
    }
}
