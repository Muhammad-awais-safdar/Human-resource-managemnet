package com.awais.hr.module.analytics.service;

import java.util.List;
import java.util.Map;

public interface TenantAnalyticsService {
    Map<String, Object> getSaaSOverview();
    List<Map<String, Object>> getTenantMetrics();
    Map<String, Object> recordMetric(Map<String, Object> body);
}
