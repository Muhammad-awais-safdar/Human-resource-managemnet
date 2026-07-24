package com.awais.hr.module.engagement.service;

import java.util.List;
import java.util.Map;

public interface EngagementService {
    List<Map<String, Object>> getSurveys();
    Map<String, Object> createSurvey(Map<String, Object> body);
    List<Map<String, Object>> getRecognitions();
    Map<String, Object> sendRecognition(String senderEmail, Map<String, Object> body);
    List<Map<String, Object>> getSuggestions();
    Map<String, Object> submitSuggestion(Map<String, Object> body);
}
