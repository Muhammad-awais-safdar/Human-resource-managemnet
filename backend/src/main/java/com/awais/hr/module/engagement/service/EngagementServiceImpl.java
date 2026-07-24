package com.awais.hr.module.engagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class EngagementServiceImpl implements EngagementService {

    private static final Logger log = LoggerFactory.getLogger(EngagementServiceImpl.class);
    private final DataSource dataSource;

    public EngagementServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSurveys() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, title, survey_type, status, start_date, end_date, created_at " +
                "FROM engagement_survey ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createSurvey(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Survey title is required.");
        }
        String surveyType = body.get("surveyType") != null ? (String) body.get("surveyType") : "PULSE";
        String status = body.get("status") != null ? (String) body.get("status") : "ACTIVE";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO engagement_survey (id, title, survey_type, status) VALUES (?, ?, ?, ?)",
                id, title.trim(), surveyType, status
        );
        log.info("Engagement survey created: id={} title={}", id, title);
        return Map.of("id", id, "title", title, "status", status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecognitions() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, sender_id, receiver_id, badge_name, message, points, created_at " +
                "FROM employee_recognition ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> sendRecognition(String senderEmail, Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String receiverId = (String) body.get("receiverId");
        if (receiverId == null || receiverId.isBlank()) {
            throw new IllegalArgumentException("Receiver ID is required.");
        }
        String badgeName = body.get("badgeName") != null ? (String) body.get("badgeName") : "STAR_PERFORMER";
        String message = (String) body.get("message");
        Number ptsNum = (Number) body.getOrDefault("points", 50);
        int points = ptsNum.intValue();

        List<String> senders = jdbc.queryForList("SELECT id FROM employee WHERE email = ?", String.class, senderEmail);
        String senderId = senders.isEmpty() ? receiverId : senders.get(0);

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO employee_recognition (id, sender_id, receiver_id, badge_name, message, points) VALUES (?, ?, ?, ?, ?, ?)",
                id, senderId, receiverId, badgeName, message, points
        );
        log.info("Recognition badge sent: id={} badge={} receiver={}", id, badgeName, receiverId);
        return Map.of("id", id, "badgeName", badgeName, "receiverId", receiverId, "points", points);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSuggestions() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, category, suggestion_text, is_anonymous, submitter_id, status, created_at " +
                "FROM suggestion_box ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> submitSuggestion(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String text = (String) body.get("suggestionText");
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Suggestion text is required.");
        }
        String category = body.get("category") != null ? (String) body.get("category") : "WORKPLACE_CULTURE";
        Boolean isAnon = body.get("isAnonymous") != null ? (Boolean) body.get("isAnonymous") : true;

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO suggestion_box (id, category, suggestion_text, is_anonymous, status) VALUES (?, ?, ?, ?, 'SUBMITTED')",
                id, category, text.trim(), isAnon
        );
        log.info("Suggestion submitted: id={} category={}", id, category);
        return Map.of("id", id, "category", category, "status", "SUBMITTED");
    }
}
