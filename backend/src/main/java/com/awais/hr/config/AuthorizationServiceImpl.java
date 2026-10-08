package com.awais.hr.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AuthorizationServiceImpl implements AuthorizationService {

    private static final Logger log = LoggerFactory.getLogger(AuthorizationServiceImpl.class);

    private static final Set<String> ADMIN_ROLES = Set.of(
            "SUPER_ADMIN", "SYSTEM_ADMIN", "TENANT_ADMIN",
            "ROLE_SUPER_ADMIN", "ROLE_SYSTEM_ADMIN", "ROLE_TENANT_ADMIN"
    );

    private final DataSource dataSource;

    public AuthorizationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public boolean hasPermission(String email, String permissionCode) {
        if (email == null || email.isBlank() || permissionCode == null || permissionCode.isBlank()) {
            return false;
        }

        // Admin check bypass
        if (isAdminUser(email)) {
            return true;
        }

        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            String sql = "SELECT COUNT(*) FROM employee e " +
                         "JOIN employee_role er ON e.id = er.employee_id " +
                         "JOIN role r ON er.role_id = r.id " +
                         "JOIN role_permission rp ON r.id = rp.role_id " +
                         "JOIN permission p ON rp.permission_id = p.id " +
                         "WHERE e.email = ? AND p.name = ? AND e.status = 'ACTIVE' AND COALESCE(r.status, 'ACTIVE') = 'ACTIVE'";

            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email, permissionCode);
            return count != null && count > 0;
        } catch (Exception e) {
            log.warn("Failed to check permission for {} / {}: {}", email, permissionCode, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean hasPermission(String email, String permissionCode, String requiredScope) {
        if (email == null || permissionCode == null || permissionCode.isBlank()) {
            return false;
        }

        if (isAdminUser(email)) {
            return true;
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String sql = "SELECT COUNT(*) FROM employee e " +
                     "JOIN employee_role er ON e.id = er.employee_id " +
                     "JOIN role r ON er.role_id = r.id " +
                     "JOIN role_permission rp ON r.id = rp.role_id " +
                     "JOIN permission p ON rp.permission_id = p.id " +
                     "WHERE e.email = ? AND p.name = ? AND (rp.access_scope = ? OR rp.access_scope = 'COMPANY' OR rp.access_scope = 'GLOBAL') " +
                     "AND e.status = 'ACTIVE' AND COALESCE(r.status, 'ACTIVE') = 'ACTIVE'";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email, permissionCode, requiredScope);
        return count != null && count > 0;
    }

    @Override
    public boolean hasAnyPermission(String email, String... permissionCodes) {
        if (email == null || permissionCodes == null || permissionCodes.length == 0) {
            return false;
        }
        for (String perm : permissionCodes) {
            if (hasPermission(email, perm)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean hasRole(String email, String roleName) {
        if (email == null || roleName == null || roleName.isBlank()) {
            return false;
        }
        List<String> roles = getUserRoles(email);
        if (roles == null || roles.isEmpty()) {
            return false;
        }
        String cleanRoleName = roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
        return roles.stream()
                .filter(Objects::nonNull)
                .anyMatch(r -> {
                    String cleanR = r.startsWith("ROLE_") ? r.substring(5) : r;
                    return cleanR.equalsIgnoreCase(cleanRoleName);
                });
    }

    @Override
    public List<String> getUserRoles(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }
        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            String sql = "SELECT DISTINCT r.name FROM employee e " +
                         "JOIN employee_role er ON e.id = er.employee_id " +
                         "JOIN role r ON er.role_id = r.id " +
                         "WHERE e.email = ? AND e.status = 'ACTIVE' AND COALESCE(r.status, 'ACTIVE') = 'ACTIVE'";

            return jdbcTemplate.queryForList(sql, String.class, email);
        } catch (Exception e) {
            log.warn("Failed to fetch user roles for {}: {}", email, e.getMessage());
            return List.of();
        }
    }

    @Override
    public List<String> getUserPermissions(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }
        if (isAdminUser(email)) {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            return jdbcTemplate.queryForList("SELECT DISTINCT name FROM permission", String.class);
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String sql = "SELECT DISTINCT p.name FROM employee e " +
                     "JOIN employee_role er ON e.id = er.employee_id " +
                     "JOIN role r ON er.role_id = r.id " +
                     "JOIN role_permission rp ON r.id = rp.role_id " +
                     "JOIN permission p ON rp.permission_id = p.id " +
                     "WHERE e.email = ? AND e.status = 'ACTIVE' AND COALESCE(r.status, 'ACTIVE') = 'ACTIVE'";

        return jdbcTemplate.queryForList(sql, String.class, email);
    }

    @Override
    public void checkPermission(String email, String permissionCode) {
        if (!hasPermission(email, permissionCode)) {
            String errorMsg = "Forbidden: User " + email + " missing required permission '" + permissionCode + "'";
            log.warn("[AUTHORIZATION REJECTION] {}", errorMsg);
            throw new SecurityException(errorMsg);
        }
    }

    @Override
    public void checkRole(String email, String roleName) {
        if (!hasRole(email, roleName)) {
            String errorMsg = "Forbidden: User " + email + " missing required role '" + roleName + "'";
            log.warn("[AUTHORIZATION REJECTION] {}", errorMsg);
            throw new SecurityException(errorMsg);
        }
    }

    @Override
    public boolean isResourceAccessible(String email, String permissionCode, String targetEmployeeId, String targetOrgUnitId) {
        if (email == null || email.isBlank() || permissionCode == null || permissionCode.isBlank()) {
            return false;
        }

        if (isAdminUser(email)) {
            return true;
        }

        if (!hasPermission(email, permissionCode)) {
            return false;
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        // Get user's employee ID and org_unit_id
        List<Map<String, Object>> actorList = jdbcTemplate.queryForList(
                "SELECT id, org_unit_id FROM employee WHERE email = ? AND status = 'ACTIVE'", email);
        if (actorList.isEmpty()) {
            return false;
        }
        Map<String, Object> actorMap = actorList.get(0);
        String actorEmpId = (String) actorMap.get("id");
        String actorOrgUnitId = (String) actorMap.get("org_unit_id");

        // Query scopes granted for this permission across all user's assigned active roles
        String scopeSql = "SELECT rp.access_scope FROM employee e " +
                "JOIN employee_role er ON e.id = er.employee_id " +
                "JOIN role r ON er.role_id = r.id " +
                "JOIN role_permission rp ON r.id = rp.role_id " +
                "JOIN permission p ON rp.permission_id = p.id " +
                "WHERE e.email = ? AND p.name = ? AND e.status = 'ACTIVE' AND COALESCE(r.status, 'ACTIVE') = 'ACTIVE'";

        List<String> scopes = jdbcTemplate.queryForList(scopeSql, String.class, email, permissionCode);
        if (scopes.isEmpty()) {
            return false;
        }

        if (scopes.contains("GLOBAL") || scopes.contains("COMPANY")) {
            return true;
        }

        if (scopes.contains("DEPARTMENT")) {
            if (targetOrgUnitId != null && targetOrgUnitId.equalsIgnoreCase(actorOrgUnitId)) {
                return true;
            }
            if (targetEmployeeId != null) {
                List<String> targetOrg = jdbcTemplate.queryForList(
                        "SELECT org_unit_id FROM employee WHERE id = ?", String.class, targetEmployeeId);
                if (!targetOrg.isEmpty() && actorOrgUnitId != null && actorOrgUnitId.equalsIgnoreCase(targetOrg.get(0))) {
                    return true;
                }
            }
        }

        if (scopes.contains("TEAM")) {
            if (targetEmployeeId != null && targetEmployeeId.equalsIgnoreCase(actorEmpId)) {
                return true;
            }
            // Check if actor is manager of target's org unit
            if (targetEmployeeId != null) {
                List<String> managedOrgs = jdbcTemplate.queryForList(
                        "SELECT id FROM org_unit WHERE manager_id = ?", String.class, actorEmpId);
                List<String> targetOrg = jdbcTemplate.queryForList(
                        "SELECT org_unit_id FROM employee WHERE id = ?", String.class, targetEmployeeId);
                if (!managedOrgs.isEmpty() && !targetOrg.isEmpty() && managedOrgs.contains(targetOrg.get(0))) {
                    return true;
                }
            }
        }

        if (scopes.contains("SELF")) {
            return targetEmployeeId != null && targetEmployeeId.equalsIgnoreCase(actorEmpId);
        }

        return false;
    }

    private boolean isAdminUser(String email) {
        List<String> userRoles = getUserRoles(email);
        if (userRoles == null || userRoles.isEmpty()) {
            return false;
        }
        return userRoles.stream()
                .filter(Objects::nonNull)
                .anyMatch(ADMIN_ROLES::contains);
    }
}
