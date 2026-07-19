package com.awais.hr.module.communication.service;

import java.util.List;
import java.util.Map;

public interface CommunicationService {
    List<Map<String, Object>> getAnnouncements();
    void postAnnouncement(String email, String title, String content, String targetAudience, String expiresAt);
    void deleteAnnouncement(String id);
    List<Map<String, Object>> getNotifications(String email);
    void markNotificationRead(String notificationId);
    void sendNotification(String employeeId, String title, String message, String category);
    long getUnreadCount(String email);
}
