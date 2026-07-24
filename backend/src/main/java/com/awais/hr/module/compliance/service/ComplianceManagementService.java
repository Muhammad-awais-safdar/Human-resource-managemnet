package com.awais.hr.module.compliance.service;

import java.util.List;
import java.util.Map;

public interface ComplianceManagementService {
    List<Map<String, Object>> getChecklists();
    Map<String, Object> createChecklist(Map<String, Object> body);
    List<Map<String, Object>> getRiskAssessments();
    Map<String, Object> createRiskAssessment(Map<String, Object> body);
    List<Map<String, Object>> getPolicyAcknowledgements();
    Map<String, Object> acknowledgePolicy(String email, Map<String, Object> body);
}
