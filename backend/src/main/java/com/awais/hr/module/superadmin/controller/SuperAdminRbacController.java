package com.awais.hr.module.superadmin.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.module.superadmin.service.SuperAdminRbacService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/superadmin/rbac", "/api/v1/superadmin/rbac"})
public class SuperAdminRbacController {

    private final SuperAdminRbacService rbacService;

    public SuperAdminRbacController(SuperAdminRbacService rbacService) {
        this.rbacService = rbacService;
    }

    @GetMapping("/roles")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getRoles() {
        return ApiResponse.success(rbacService.getPlatformRoles());
    }

    @PostMapping("/roles")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> createRole(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        return ApiResponse.success(rbacService.createPlatformRole(name, description));
    }

    @DeleteMapping("/roles/{id}")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> deleteRole(@PathVariable String id) {
        rbacService.deletePlatformRole(id);
        return ApiResponse.success(Map.of("roleId", id, "deleted", true));
    }

    @PutMapping("/roles/{id}/permissions")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> updateRolePermissions(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> body) {
        List<String> permissionIds = body.get("permissionIds");
        return ApiResponse.success(rbacService.updateRolePermissions(id, permissionIds));
    }

    @GetMapping("/permissions")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getPermissions() {
        return ApiResponse.success(rbacService.getPlatformPermissions());
    }

    @PostMapping("/permissions")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> createPermission(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        return ApiResponse.success(rbacService.createPlatformPermission(name, description));
    }

    @GetMapping("/users")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<List<Map<String, Object>>> getPlatformUsers() {
        return ApiResponse.success(rbacService.getPlatformUsers());
    }

    @PostMapping("/users/{userId}/roles")
    @HasPermission("SUPER_ADMIN")
    public ApiResponse<Map<String, Object>> updateUserRoles(
            @PathVariable String userId,
            @RequestBody Map<String, List<String>> body) {
        List<String> roleIds = body.get("roleIds");
        return ApiResponse.success(rbacService.updateUserRoles(userId, roleIds));
    }
}
