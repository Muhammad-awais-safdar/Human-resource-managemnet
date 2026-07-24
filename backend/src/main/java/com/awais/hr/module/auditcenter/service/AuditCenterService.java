package com.awais.hr.module.auditcenter.service;

import java.util.List;
import java.util.Map;

public interface AuditCenterService {
    List<Map<String, Object>> getLogs();
    Map<String, Object> recordAuditLog(Map<String, Object> body);
    String exportCsv();
}
