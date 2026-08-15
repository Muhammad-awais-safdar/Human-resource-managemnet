package com.awais.hr.module.superadmin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

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

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllModules() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT module_key, name, category, description, is_globally_enabled, created_at, updated_at FROM platform_module ORDER BY category ASC, name ASC");
    }

    @Override
    public Map<String, Object> toggleGlobalModule(String moduleKey, boolean enabled) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        int updated = jdbc.update("UPDATE platform_module SET is_globally_enabled = ?, updated_at = NOW() WHERE module_key = ?", enabled, moduleKey.toUpperCase());
        if (updated == 0) {
            throw new IllegalArgumentException("Module key not found: " + moduleKey);
        }
        moduleCache.clear(); // Evict cache
        log.info("Super Admin updated global module status: module={} enabled={}", moduleKey, enabled);
        return Map.of("moduleKey", moduleKey.toUpperCase(), "isGloballyEnabled", enabled, "updated", true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTenantOverrides(String tenantId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT tmo.module_key, pm.name, pm.category, tmo.is_enabled, tmo.updated_at " +
                "FROM tenant_module_override tmo " +
                "JOIN platform_module pm ON tmo.module_key = pm.module_key " +
                "WHERE tmo.tenant_id = ?", tenantId
        );
    }

    @Override
    public Map<String, Object> setTenantModuleOverride(String tenantId, String moduleKey, Boolean enabled) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String upperKey = moduleKey.toUpperCase();

        if (enabled == null) {
            // Reset to global default
            jdbc.update("DELETE FROM tenant_module_override WHERE tenant_id = ? AND module_key = ?", tenantId, upperKey);
            moduleCache.clear();
            return Map.of("tenantId", tenantId, "moduleKey", upperKey, "overrideCleared", true);
        }

        jdbc.update(
                "INSERT INTO tenant_module_override (tenant_id, module_key, is_enabled, updated_at) " +
                "VALUES (?, ?, ?, NOW()) " +
                "ON CONFLICT (tenant_id, module_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW()",
                tenantId, upperKey, enabled
        );
        moduleCache.clear();
        log.info("Super Admin set tenant module override: tenantId={} module={} enabled={}", tenantId, upperKey, enabled);
        return Map.of("tenantId", tenantId, "moduleKey", upperKey, "isEnabled", enabled);
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

        if (tenantIdentifier == null || tenantIdentifier.isBlank() || "system".equalsIgnoreCase(tenantIdentifier) || "awais".equalsIgnoreCase(tenantIdentifier)) {
            moduleCache.put(cacheKey, true);
            return true;
        }

        // 2. Check Tenant Specific Override (by ID or subdomain)
        try {
            List<Map<String, Object>> overrides = jdbc.queryForList(
                    "SELECT tmo.is_enabled FROM tenant_module_override tmo " +
                    "JOIN tenant t ON tmo.tenant_id = t.id " +
                    "WHERE (t.id = ? OR t.subdomain = ?) AND tmo.module_key = ?",
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
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getActiveModulesForTenant(String tenantIdentifier) {
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
    }
}
