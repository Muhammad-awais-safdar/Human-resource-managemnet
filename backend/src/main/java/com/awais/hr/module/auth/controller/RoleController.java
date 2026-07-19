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
            // Get all system permissions
            List<Map<String, Object>> allPermissions = jdbcTemplate.queryForList(
                    "SELECT id, name, description FROM permission ORDER BY name"
            );

            // Get all roles
            List<Map<String, Object>> rolesRaw = jdbcTemplate.queryForList(
                    "SELECT id, name, description FROM role ORDER BY name"
            );

            // Get all role-permission mappings
            List<Map<String, Object>> mappings = jdbcTemplate.queryForList(
                    "SELECT role_id, permission_id FROM role_permission"
            );

            // Group permissions by role
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
                    "INSERT INTO role (id, name, description) VALUES (?, ?, ?)",
                    roleId, name.toUpperCase().trim(), description
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
            // Delete existing mappings for this role
            jdbcTemplate.update("DELETE FROM role_permission WHERE role_id = ?", id);

            // Insert new mappings in batch
            for (String pId : permissionIds) {
                jdbcTemplate.update(
                        "INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)",
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
}
