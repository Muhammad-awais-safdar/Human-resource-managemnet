package com.awais.hr.module.businesscontinuity.service;

import java.util.List;
import java.util.Map;

public interface BusinessContinuityService {
    List<Map<String, Object>> getBackups();
    Map<String, Object> triggerBackup(Map<String, Object> body);
}
