package com.awais.hr.module.workforce.service;

import java.util.List;
import java.util.Map;

public interface WorkforcePlanningService {

    List<Map<String, Object>> getPlans();

    Map<String, Object> createPlan(Map<String, Object> body);

    List<Map<String, Object>> getPositionBudgets(String planId);

    Map<String, Object> addPositionBudget(String planId, Map<String, Object> body);

    List<Map<String, Object>> getForecastScenarios(String planId);

    Map<String, Object> createForecastScenario(String planId, Map<String, Object> body);

    Map<String, Object> getPlanningAnalytics(String planId);
}
