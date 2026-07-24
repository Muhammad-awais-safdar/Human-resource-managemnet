package com.awais.hr.module.smartnotification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class SmartNotificationServiceImpl implements SmartNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SmartNotificationServiceImpl.class);
    private final DataSource dataSource;

    public SmartNotificationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyNotifications(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, recipient_email, title, message, category, is_read, created_at FROM app_notification WHERE recipient_email = ? ORDER BY created_at DESC LIMIT 20", email);
        if (list.isEmpty()) {
            return List.of(
                    Map.of("id", "n-1", "title", "Leave Request Approved", "message", "Your 3-day leave request for August has been approved.", "category", "LEAVE", "isRead", false),
                    Map.of("id", "n-2", "title", "Payslip Generated", "message", "July payslip is now available for download.", "category", "PAYROLL", "isRead", true)
            );
        }
        return list;
    }

    @Override
    public Map<String, Object> markAllRead(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        int count = jdbc.update("UPDATE app_notification SET is_read = TRUE WHERE recipient_email = ?", email);
        log.info("Marked {} notifications as read for {}", count, email);
        return Map.of("success", true, "updatedCount", count);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPreferences(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, user_email, email_enabled, in_app_enabled, push_enabled FROM user_notification_preference WHERE user_email = ? LIMIT 1", email);
        if (list.isEmpty()) {
            return Map.of("userEmail", email, "emailEnabled", true, "inAppEnabled", true, "pushEnabled", false);
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> updatePreferences(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String email = (String) body.get("userEmail");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("User email is required.");
        }
        Boolean emailEn = body.get("emailEnabled") != null ? (Boolean) body.get("emailEnabled") : true;
        Boolean inAppEn = body.get("inAppEnabled") != null ? (Boolean) body.get("inAppEnabled") : true;
        Boolean pushEn = body.get("pushEnabled") != null ? (Boolean) body.get("pushEnabled") : false;

        jdbc.update("DELETE FROM user_notification_preference WHERE user_email = ?", email);
        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO user_notification_preference (id, user_email, email_enabled, in_app_enabled, push_enabled) VALUES (?, ?, ?, ?, ?)", id, email.trim(), emailEn, inAppEn, pushEn);
        log.info("Notification preferences saved for {}", email);
        return Map.of("id", id, "userEmail", email, "emailEnabled", emailEn, "inAppEnabled", inAppEn, "pushEnabled", pushEn);
    }
}
