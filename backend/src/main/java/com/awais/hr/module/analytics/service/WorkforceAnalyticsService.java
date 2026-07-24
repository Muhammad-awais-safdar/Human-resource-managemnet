package com.awais.hr.module.analytics.service;

import java.util.List;
import java.util.Map;

public interface WorkforceAnalyticsService {
    List<Map<String, Object>> getMetricSnapshots();
    Map<String, Object> recordMetricSnapshot(Map<String, Object> body);
    List<Map<String, Object>> getAttritionTrends();
    Map<String, Object> recordAttritionTrend(Map<String, Object> body);
}
