package com.awais.hr.module.accessibility.service;

import java.util.Map;

public interface AccessibilityService {
    Map<String, Object> getPreferences();
    Map<String, Object> updatePreferences(Map<String, Object> body);
}
