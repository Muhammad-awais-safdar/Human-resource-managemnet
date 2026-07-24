package com.awais.hr.module.developerplatform.service;

import java.util.List;
import java.util.Map;

public interface DeveloperPlatformService {
    List<Map<String, Object>> getWebhooks();
    Map<String, Object> registerWebhook(Map<String, Object> body);
}
