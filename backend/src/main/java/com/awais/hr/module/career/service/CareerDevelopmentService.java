package com.awais.hr.module.career.service;

import java.util.List;
import java.util.Map;

public interface CareerDevelopmentService {
    List<Map<String, Object>> getCareerPaths();
    Map<String, Object> createCareerPath(Map<String, Object> body);
    List<Map<String, Object>> getMentorshipPairs();
    Map<String, Object> createMentorshipPair(Map<String, Object> body);
    List<Map<String, Object>> getDevelopmentPlans();
    Map<String, Object> createDevelopmentPlan(Map<String, Object> body);
}
