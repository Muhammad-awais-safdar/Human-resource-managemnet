package com.awais.hr.module.superadmin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class SuperAdminRbacServiceImpl implements SuperAdminRbacService {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminRbacServiceImpl.class);
    private final DataSource dataSource;

    public SuperAdminRbacServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPlatformRoles() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> rolesRaw = jdbc.queryForList("SELECT id, name, description FROM platform_role ORDER BY name");
        List<Map<String, Object>> mappings = jdbc.queryForList("SELECT role_id, permission_id FROM platform_role_permission");

        Map<String, List<String>> rolePermsMap = new HashMap<>();
        for (Map<String, Object> m : mappings) {
            String rId = (String) m.get("role_id");
            String pId = (String) m.get("permission_id");
            rolePermsMap.computeIfAbsent(rId, k -> new ArrayList<>()).add(pId);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> r : rolesRaw) {
            Map<String, Object> map = new HashMap<>(r);
            String roleId = (String) r.get("id");
            map.put("permissions", rolePermsMap.getOrDefault(roleId, Collections.emptyList()));
            result.add(map);
        }
        return result;
    }

    @Override
    public Map<String, Object> createPlatformRole(String name, String description) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Platform role name is required.");
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String roleId = "role_" + name.toLowerCase().trim().replaceAll("[^a-z0-9_]", "_");
        String formattedName = name.toUpperCase().trim();

        jdbc.update("INSERT INTO platform_role (id, name, description) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description", roleId, formattedName, description);
        log.info("Super Admin created platform role: id={} name={}", roleId, formattedName);
        return Map.of("id", roleId, "name", formattedName, "description", description != null ? description : "");
    }

    @Override
    public void deletePlatformRole(String roleId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("DELETE FROM platform_role WHERE id = ?", roleId);
        log.info("Super Admin deleted platform role: id={}", roleId);
    }

    @Override
    public Map<String, Object> updateRolePermissions(String roleId, List<String> permissionIds) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("DELETE FROM platform_role_permission WHERE role_id = ?", roleId);

        if (permissionIds != null) {
            for (String pId : permissionIds) {
                jdbc.update("INSERT INTO platform_role_permission (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING", roleId, pId);
            }
        }

        log.info("Super Admin updated permissions for platform role: id={} count={}", roleId, permissionIds != null ? permissionIds.size() : 0);
        return Map.of("roleId", roleId, "updatedPermissions", permissionIds != null ? permissionIds : List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPlatformPermissions() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, name, description FROM platform_permission ORDER BY name");
    }

    @Override
    public Map<String, Object> createPlatformPermission(String name, String description) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Permission name is required.");
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String permId = "perm_" + name.toLowerCase().trim().replaceAll("[^a-z0-9_]", "_");
        String formattedName = name.toLowerCase().trim();

        jdbc.update("INSERT INTO platform_permission (id, name, description) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description", permId, formattedName, description);
        log.info("Super Admin created platform permission: id={} name={}", permId, formattedName);
        return Map.of("id", permId, "name", formattedName, "description", description != null ? description : "");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPlatformUsers() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> usersRaw = jdbc.queryForList("SELECT id, email, first_name, last_name, status, created_at FROM platform_user ORDER BY created_at DESC");
        List<Map<String, Object>> userRolesRaw = jdbc.queryForList("SELECT user_id, role_id FROM platform_user_role");

        Map<String, List<String>> userRolesMap = new HashMap<>();
        for (Map<String, Object> ur : userRolesRaw) {
            String uId = (String) ur.get("user_id");
            String rId = (String) ur.get("role_id");
            userRolesMap.computeIfAbsent(uId, k -> new ArrayList<>()).add(rId);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> u : usersRaw) {
            Map<String, Object> map = new HashMap<>(u);
            String userId = (String) u.get("id");
            map.put("roles", userRolesMap.getOrDefault(userId, Collections.emptyList()));
            result.add(map);
        }
        return result;
    }

    @Override
    public Map<String, Object> updateUserRoles(String userId, List<String> roleIds) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("DELETE FROM platform_user_role WHERE user_id = ?", userId);

        if (roleIds != null) {
            for (String rId : roleIds) {
                jdbc.update("INSERT INTO platform_user_role (user_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING", userId, rId);
            }
        }

        log.info("Super Admin updated roles for platform user: userId={} roleCount={}", userId, roleIds != null ? roleIds.size() : 0);
        return Map.of("userId", userId, "assignedRoles", roleIds != null ? roleIds : List.of());
    }
}
