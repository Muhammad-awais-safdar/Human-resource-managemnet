package com.awais.hr.module.superadmin.service;

import java.util.List;
import java.util.Map;

public interface ModuleManagementService {

    List<Map<String, Object>> getAllModules();

    Map<String, Object> toggleGlobalModule(String moduleKey, boolean enabled);

    List<Map<String, Object>> getTenantOverrides(String tenantId);

    Map<String, Object> setTenantModuleOverride(String tenantId, String moduleKey, Boolean enabled);

    boolean isModuleEnabledForTenant(String tenantIdOrSubdomain, String moduleKey);

    List<String> getActiveModulesForTenant(String tenantIdOrSubdomain);
}
