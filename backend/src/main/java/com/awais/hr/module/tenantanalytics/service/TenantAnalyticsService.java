package com.awais.hr.module.tenantanalytics.service;

import java.util.List;
import java.util.Map;

public interface TenantAnalyticsService {
    Map<String, Object> getSaaSOverview();
    List<Map<String, Object>> getChurnRisks();
    Map<String, Object> recordMetric(Map<String, Object> body);
}
