package com.awais.hr.module.ai.service;

import java.util.List;
import java.util.Map;

public interface AiAutomationService {
    List<Map<String, Object>> getAnomalies();
    void runAnomalyDetection();
    Map<String, Object> evaluateCandidateFit(String candidateId);
    Map<String, Object> predictAttritionRisk(String employeeId);
}
