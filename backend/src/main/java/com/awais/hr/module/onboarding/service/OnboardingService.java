package com.awais.hr.module.onboarding.service;

import com.awais.hr.module.onboarding.dto.PolicySignatureRequestDTO;
import java.util.List;
import java.util.Map;

public interface OnboardingService {
    List<Map<String, Object>> getTasks(String email);
    void completeTask(String id);
    List<Map<String, Object>> getAssets(String email);
    void logSignature(PolicySignatureRequestDTO dto);
}
