package com.awais.hr.module.superadmin.service;

import java.util.List;
import java.util.Map;

public interface SuperAdminTenantService {
    List<Map<String, Object>> getLogs();
    Map<String, Object> logTenantAction(Map<String, Object> body);

    List<Map<String, Object>> getTenantDeepDive();
    Map<String, Object> updateTenantStatus(String tenantId, String status);
    Map<String, Object> extendTenantSubscription(String tenantId, int days);
    List<Map<String, Object>> getTenantUsers(String tenantId);
}
