package com.awais.hr.module.superadmin.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.superadmin.service.ModuleManagementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class ModuleManagementController {

    private final ModuleManagementService moduleService;

    public ModuleManagementController(ModuleManagementService moduleService) {
        this.moduleService = moduleService;
    }

    @GetMapping({"/superadmin/modules", "/api/v1/superadmin/modules"})
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getAllModules() {
        return ApiResponse.success(moduleService.getAllModules());
    }

    @PutMapping({"/superadmin/modules/{moduleKey}/toggle", "/api/v1/superadmin/modules/{moduleKey}/toggle"})
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> toggleGlobalModule(
            @PathVariable String moduleKey,
            @RequestBody Map<String, Boolean> payload) {
        Boolean enabled = payload.getOrDefault("enabled", true);
        return ApiResponse.success(moduleService.toggleGlobalModule(moduleKey, enabled));
    }

    @GetMapping({"/superadmin/modules/overrides/{tenantId}", "/api/v1/superadmin/modules/overrides/{tenantId}"})
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getTenantOverrides(@PathVariable String tenantId) {
        return ApiResponse.success(moduleService.getTenantOverrides(tenantId));
    }

    @PostMapping({"/superadmin/modules/overrides", "/api/v1/superadmin/modules/overrides"})
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> setTenantOverride(@RequestBody Map<String, Object> payload) {
        String tenantId = (String) payload.get("tenantId");
        String moduleKey = (String) payload.get("moduleKey");
        Boolean enabled = (Boolean) payload.get("enabled"); // null means clear override
        return ApiResponse.success(moduleService.setTenantModuleOverride(tenantId, moduleKey, enabled));
    }

    @GetMapping({"/tenants/active-modules", "/api/v1/tenants/active-modules"})
    public ApiResponse<List<String>> getActiveModulesForTenant(
            @RequestParam(required = false) String tenant) {
        String tenantIdOrSubdomain = tenant != null ? tenant : TenantContextHolder.getCurrentTenant();
        return ApiResponse.success(moduleService.getActiveModulesForTenant(tenantIdOrSubdomain));
    }
}
