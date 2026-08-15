package com.awais.hr.module.auth.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.context.TenantContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.util.*;

@RestController
@RequestMapping("/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    private final DataSource routingDataSource;

    public RoleController(DataSource routingDataSource) {
        this.routingDataSource = routingDataSource;
    }

    @GetMapping
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getRoles() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "No active tenant context resolved."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            // 1. Fetch permissions with enriched metadata
            List<Map<String, Object>> allPermissions = jdbcTemplate.queryForList(
                    "SELECT id, name, description, COALESCE(module_key, 'CORE_HR') as module_key, " +
                    "COALESCE(feature_key, 'GENERAL') as feature_key, COALESCE(action_key, 'READ') as action_key, " +
                    "COALESCE(ui_label, name) as ui_label, COALESCE(is_sensitive, false) as is_sensitive " +
                    "FROM permission ORDER BY module_key, feature_key, name"
            );

            // 2. Fetch roles with system status and user counts
            List<Map<String, Object>> rolesRaw = jdbcTemplate.queryForList(
                    "SELECT r.id, r.name, r.description, COALESCE(r.is_system_role, false) as is_system_role, " +
                    "COALESCE(r.status, 'ACTIVE') as status, " +
                    "(SELECT COUNT(*) FROM employee_role er WHERE er.role_id = r.id) as user_count " +
                    "FROM role r ORDER BY r.name"
            );

            // 3. Fetch role-permission mappings with access scope
            List<Map<String, Object>> mappings = jdbcTemplate.queryForList(
                    "SELECT role_id, permission_id, COALESCE(access_scope, 'COMPANY') as access_scope FROM role_permission"
            );

            Map<String, List<String>> rolePermissionsMap = new HashMap<>();
            for (Map<String, Object> mapping : mappings) {
                String rId = (String) mapping.get("role_id");
                String pId = (String) mapping.get("permission_id");
                rolePermissionsMap.computeIfAbsent(rId, k -> new ArrayList<>()).add(pId);
            }

            List<Map<String, Object>> roles = new ArrayList<>();
            for (Map<String, Object> r : rolesRaw) {
                String rId = (String) r.get("id");
                Map<String, Object> roleMap = new HashMap<>(r);
                roleMap.put("permissions", rolePermissionsMap.getOrDefault(rId, Collections.emptyList()));
                roles.add(roleMap);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "roles", roles,
                    "allPermissions", allPermissions
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to retrieve roles: " + e.getMessage()));
        }
    }

    @PostMapping
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createRole(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Role name is required."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);
        String roleId = UUID.randomUUID().toString();

        try {
            jdbcTemplate.update(
                    "INSERT INTO role (id, name, description, is_system_role, status) VALUES (?, ?, ?, false, 'ACTIVE')",
                    roleId, name.toUpperCase().trim().replace(" ", "_"), description
            );
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Role created successfully.",
                    "roleId", roleId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to create role: " + e.getMessage()));
        }
    }

    @PostMapping("/clone")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> cloneRole(@RequestBody Map<String, String> body) {
        String sourceRoleId = body.get("sourceRoleId");
        String newName = body.get("name");
        String description = body.get("description");

        if (sourceRoleId == null || newName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "sourceRoleId and new role name are required."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);
        String newRoleId = UUID.randomUUID().toString();

        try {
            jdbcTemplate.update(
                    "INSERT INTO role (id, name, description, is_system_role, status) VALUES (?, ?, ?, false, 'ACTIVE')",
                    newRoleId, newName.toUpperCase().trim().replace(" ", "_"), description
            );

            // Copy permissions
            List<Map<String, Object>> perms = jdbcTemplate.queryForList(
                    "SELECT permission_id, COALESCE(access_scope, 'COMPANY') as access_scope FROM role_permission WHERE role_id = ?",
                    sourceRoleId
            );
            for (Map<String, Object> p : perms) {
                jdbcTemplate.update(
                        "INSERT INTO role_permission (role_id, permission_id, access_scope) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                        newRoleId, p.get("permission_id"), p.get("access_scope")
                );
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Role cloned successfully.",
                    "roleId", newRoleId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to clone role: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> deleteRole(@PathVariable String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            // Guard system roles
            List<Map<String, Object>> roles = jdbcTemplate.queryForList(
                    "SELECT name, COALESCE(is_system_role, false) as is_system_role FROM role WHERE id = ?", id
            );

            if (roles.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Role not found."));
            }

            Boolean isSystem = (Boolean) roles.get(0).get("is_system_role");
            String roleName = (String) roles.get(0).get("name");

            if (Boolean.TRUE.equals(isSystem) || "TENANT_ADMIN".equalsIgnoreCase(roleName) || "SUPER_ADMIN".equalsIgnoreCase(roleName)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "System roles cannot be deleted."));
            }

            // Delete role mappings & role record
            jdbcTemplate.update("DELETE FROM role_permission WHERE role_id = ?", id);
            jdbcTemplate.update("DELETE FROM employee_role WHERE role_id = ?", id);
            jdbcTemplate.update("DELETE FROM role WHERE id = ?", id);

            return ResponseEntity.ok(Map.of("success", true, "message", "Role deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to delete role: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/permissions")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updateRolePermissions(@PathVariable String id, @RequestBody Map<String, List<String>> body) {
        List<String> permissionIds = body.get("permissionIds");
        if (permissionIds == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Permission IDs list is required."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            jdbcTemplate.update("DELETE FROM role_permission WHERE role_id = ?", id);

            for (String pId : permissionIds) {
                jdbcTemplate.update(
                        "INSERT INTO role_permission (role_id, permission_id, access_scope) VALUES (?, ?, 'COMPANY')",
                        id, pId
                );
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Role permissions updated successfully."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to update role permissions: " + e.getMessage()));
        }
    }

    @GetMapping("/user-effective/{email}")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getUserEffectivePermissions(@PathVariable String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            // Get user's assigned roles
            List<Map<String, Object>> roles = jdbcTemplate.queryForList(
                    "SELECT r.id, r.name, r.description FROM role r " +
                    "JOIN employee_role er ON r.id = er.role_id " +
                    "JOIN employee e ON er.employee_id = e.id " +
                    "WHERE e.email = ? AND e.status = 'ACTIVE'",
                    email
            );

            // Get permissions with source role breakdown
            List<Map<String, Object>> permissions = jdbcTemplate.queryForList(
                    "SELECT DISTINCT p.id, p.name, COALESCE(p.ui_label, p.name) as ui_label, " +
                    "COALESCE(p.module_key, 'CORE_HR') as module_key, COALESCE(p.is_sensitive, false) as is_sensitive, " +
                    "r.name as granted_by_role " +
                    "FROM permission p " +
                    "JOIN role_permission rp ON p.id = rp.permission_id " +
                    "JOIN role r ON rp.role_id = r.id " +
                    "JOIN employee_role er ON r.id = er.role_id " +
                    "JOIN employee e ON er.employee_id = e.id " +
                    "WHERE e.email = ? AND e.status = 'ACTIVE'",
                    email
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "email", email,
                    "assignedRoles", roles,
                    "effectivePermissions", permissions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to resolve effective permissions: " + e.getMessage()));
        }
    }

    @PostMapping("/assign-user")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> assignUserRole(@RequestBody Map<String, String> body) {
        String employeeId = body.get("employeeId");
        String roleId = body.get("roleId");

        if (employeeId == null || roleId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "employeeId and roleId are required."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            jdbcTemplate.update(
                    "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                    employeeId, roleId
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Role assigned to user successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to assign role: " + e.getMessage()));
        }
    }
}
