package com.awais.hr.module.enterprise.service;

import java.util.List;
import java.util.Map;

public interface EnterpriseFeaturesService {
    String generateApiKey(String employeeEmail, String keyName);
    List<Map<String, Object>> getApiKeys(String employeeEmail);
    void revokeApiKey(String keyId);
    boolean validateApiKey(String rawKey);
    Map<String, Object> triggerTenantBackup();
    List<Map<String, Object>> getBackups();
}
