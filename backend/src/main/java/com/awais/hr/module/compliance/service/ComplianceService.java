package com.awais.hr.module.compliance.service;

import java.util.List;
import java.util.Map;

public interface ComplianceService {
    void saveGdprConsent(String employeeEmail, boolean consentGiven);
    Map<String, Object> getGdprConsent(String employeeEmail);
    void logAudit(String action, String tableName, String recordId, String changedByEmail, String oldValue, String newValue);
    List<Map<String, Object>> getAuditLogs();
    int runDataRetentionPurge();
}
