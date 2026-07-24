package com.awais.hr.module.superadmin.service;

import java.util.List;
import java.util.Map;

public interface SuperAdminTenantService {
    List<Map<String, Object>> getLogs();
    Map<String, Object> logTenantAction(Map<String, Object> body);
}
