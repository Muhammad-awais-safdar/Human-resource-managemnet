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
public class InternalCommunicationServiceImpl implements InternalCommunicationService {

    private static final Logger log = LoggerFactory.getLogger(InternalCommunicationServiceImpl.class);
    private final DataSource dataSource;

    public InternalCommunicationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFeedPosts() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, title, content, author_id, feed_type, created_at " +
                "FROM company_feed_post ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createFeedPost(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("title");
        String content = (String) body.get("content");
        if (title == null || title.isBlank() || content == null || content.isBlank()) {
            throw new IllegalArgumentException("Title and content are required.");
        }
        String feedType = body.get("feedType") != null ? (String) body.get("feedType") : "ANNOUNCEMENT";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO company_feed_post (id, title, content, feed_type) VALUES (?, ?, ?, ?)",
                id, title.trim(), content.trim(), feedType
        );
        log.info("Feed post created: id={} title={}", id, title);
        return Map.of("id", id, "title", title, "feedType", feedType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPolls() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, question, options_json, status, created_at " +
                "FROM company_poll ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createPoll(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String question = (String) body.get("question");
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("Poll question is required.");
        }
        String optionsJson = body.get("optionsJson") != null ? (String) body.get("optionsJson") : "[\"Option A\", \"Option B\"]";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO company_poll (id, question, options_json, status) VALUES (?, ?, ?, 'ACTIVE')",
                id, question.trim(), optionsJson
        );
        log.info("Company poll created: id={} question={}", id, question);
        return Map.of("id", id, "question", question, "status", "ACTIVE");
    }
}
