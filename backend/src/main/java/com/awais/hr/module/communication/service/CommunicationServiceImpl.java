package com.awais.hr.module.communication.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class CommunicationServiceImpl implements CommunicationService {

    private static final Logger log = LoggerFactory.getLogger(CommunicationServiceImpl.class);
    private final DataSource dataSource;

    public CommunicationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAnnouncements() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT a.id, a.title, a.content, a.target_audience, a.is_pinned, a.created_at, a.expires_at, " +
                "e.first_name as author_first, e.last_name as author_last " +
                "FROM platform_announcement a " +
                "JOIN employee e ON a.created_by = e.id " +
                "WHERE a.deleted = FALSE " +
                "AND (a.expires_at IS NULL OR a.expires_at > NOW()) " +
                "ORDER BY a.is_pinned DESC, a.created_at DESC"
        );
    }

    @Override
    public void postAnnouncement(String email, String title, String content, String targetAudience, String expiresAt) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Announcement title is required.");
        if (content == null || content.isBlank()) throw new IllegalArgumentException("Announcement content is required.");

        String createdById = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        String audience = targetAudience != null ? targetAudience.toUpperCase().trim() : "ALL";
        String id = UUID.randomUUID().toString();

        if (expiresAt != null && !expiresAt.isBlank()) {
            jdbc.update(
                    "INSERT INTO platform_announcement (id, title, content, target_audience, created_by, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
                    id, title.trim(), content.trim(), audience, createdById, expiresAt
            );
        } else {
            jdbc.update(
                    "INSERT INTO platform_announcement (id, title, content, target_audience, created_by) VALUES (?, ?, ?, ?, ?)",
                    id, title.trim(), content.trim(), audience, createdById
            );
        }
        log.info("Announcement posted: id={} by={} audience={}", id, email, audience);
    }

    @Override
    public void deleteAnnouncement(String id) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("UPDATE platform_announcement SET deleted = TRUE WHERE id = ?", id);
        log.info("Announcement deleted: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotifications(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        return jdbc.queryForList(
                "SELECT id, title, message, category, is_read, created_at " +
                "FROM notification_queue " +
                "WHERE employee_id = ? AND deleted = FALSE " +
                "ORDER BY created_at DESC LIMIT 50",
                empId
        );
    }

    @Override
    public void markNotificationRead(String notificationId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("UPDATE notification_queue SET is_read = TRUE WHERE id = ?", notificationId);
    }

    @Override
    public void sendNotification(String employeeId, String title, String message, String category) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Notification title is required.");
        if (message == null || message.isBlank()) throw new IllegalArgumentException("Notification message is required.");

        String cat = category != null ? category.toUpperCase().trim() : "GENERAL";
        jdbc.update(
                "INSERT INTO notification_queue (id, employee_id, title, message, category) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), employeeId, title.trim(), message.trim(), cat
        );
        log.info("Notification queued: employee={} category={} title={}", employeeId, cat, title);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        Long count = jdbc.queryForObject(
                "SELECT COUNT(1) FROM notification_queue WHERE employee_id = ? AND is_read = FALSE AND deleted = FALSE",
                Long.class, empId
        );
        return count != null ? count : 0L;
    }
}
