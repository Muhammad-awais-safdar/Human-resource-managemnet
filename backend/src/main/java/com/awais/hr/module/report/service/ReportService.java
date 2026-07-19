package com.awais.hr.module.report.service;

import java.util.List;
import java.util.Map;

public interface ReportService {
    List<Map<String, Object>> getReportDefinitions();
    void createReportDefinition(String email, String name, String description, String queryTemplate, String parametersJson, String format, String module);
    List<Map<String, Object>> runReport(String reportId, Map<String, Object> parameters);
    String exportReportCsv(String reportId, Map<String, Object> parameters);
    Map<String, Object> getDashboardMetrics(String email);
}
