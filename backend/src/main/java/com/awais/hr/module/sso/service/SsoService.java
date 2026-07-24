package com.awais.hr.module.sso.service;

import java.util.List;
import java.util.Map;

public interface SsoService {
    Map<String, Object> getSsoConfig();
    Map<String, Object> updateSsoConfig(Map<String, Object> body);
    List<Map<String, Object>> getAuditLogs();
}
