package com.awais.hr.module.smartnotification.service;

import java.util.List;
import java.util.Map;

public interface SmartNotificationService {
    List<Map<String, Object>> getMyNotifications(String email);
    Map<String, Object> markAllRead(String email);
    Map<String, Object> getPreferences(String email);
    Map<String, Object> updatePreferences(Map<String, Object> body);
}
