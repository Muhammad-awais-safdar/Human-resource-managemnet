package com.awais.hr.module.platformoperations.service;

import java.util.List;
import java.util.Map;

public interface PlatformOperationsService {
    List<Map<String, Object>> getLogs();
    Map<String, Object> recordLog(Map<String, Object> body);
}
