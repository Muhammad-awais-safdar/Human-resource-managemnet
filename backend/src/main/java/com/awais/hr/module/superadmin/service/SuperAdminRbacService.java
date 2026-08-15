package com.awais.hr.module.superadmin.service;

import java.util.List;
import java.util.Map;

public interface SuperAdminRbacService {

    List<Map<String, Object>> getPlatformRoles();

    Map<String, Object> createPlatformRole(String name, String description);

    void deletePlatformRole(String roleId);

    Map<String, Object> updateRolePermissions(String roleId, List<String> permissionIds);

    List<Map<String, Object>> getPlatformPermissions();

    Map<String, Object> createPlatformPermission(String name, String description);

    List<Map<String, Object>> getPlatformUsers();

    Map<String, Object> updateUserRoles(String userId, List<String> roleIds);
}
