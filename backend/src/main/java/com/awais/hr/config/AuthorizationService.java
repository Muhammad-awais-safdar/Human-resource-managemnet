package com.awais.hr.config;

import java.util.List;

public interface AuthorizationService {

    /**
     * Check if user with given email has the specified permission code.
     */
    boolean hasPermission(String email, String permissionCode);

    /**
     * Check if user has specified permission under a target data access scope.
     */
    boolean hasPermission(String email, String permissionCode, String requiredScope);

    /**
     * Check if user has any of the listed permissions.
     */
    boolean hasAnyPermission(String email, String... permissionCodes);

    /**
     * Check if user holds a specific role by name.
     */
    boolean hasRole(String email, String roleName);

    /**
     * Retrieve all active roles assigned to the user.
     */
    List<String> getUserRoles(String email);

    /**
     * Retrieve all active permission codes granted to the user across all assigned roles.
     */
    List<String> getUserPermissions(String email);

    /**
     * Enforce permission check — throws SecurityException if unauthorized.
     */
    void checkPermission(String email, String permissionCode);

    /**
     * Enforce role check — throws SecurityException if unauthorized.
     */
    void checkRole(String email, String roleName);

    /**
     * Check if user with given email can access a target resource based on permission, access scope,
     * employee ownership, and organizational relationship (SELF, TEAM, DEPARTMENT, COMPANY, GLOBAL).
     */
    boolean isResourceAccessible(String email, String permissionCode, String targetEmployeeId, String targetOrgUnitId);
}
