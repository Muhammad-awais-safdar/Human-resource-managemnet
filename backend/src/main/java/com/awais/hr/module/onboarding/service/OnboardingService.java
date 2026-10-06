package com.awais.hr.module.onboarding.service;

import com.awais.hr.module.onboarding.dto.PolicySignatureRequestDTO;
import java.util.List;
import java.util.Map;

public interface OnboardingService {
    List<Map<String, Object>> getTasks(String email);
    void completeTask(String id);
    List<Map<String, Object>> getAssets(String email);
    void logSignature(PolicySignatureRequestDTO dto);

    // Onboarding & Offboarding Workflow Engine Methods
    Map<String, Object> initiateOnboarding(String employeeId, String hrEmail);
    void completeClearanceTask(String taskId, String actorEmail);
    void completeOnboarding(String onboardingId, String hrEmail);
    Map<String, Object> initiateOffboarding(String employeeId, String resignationDate, String lastWorkingDay, String reason, String hrEmail);
    void completeOffboarding(String offboardingId, String hrEmail);
    List<Map<String, Object>> getClearanceTasks(String referenceId);
}
