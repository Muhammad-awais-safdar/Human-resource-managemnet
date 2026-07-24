package com.awais.hr.module.knowledge.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class KnowledgeManagementServiceImpl implements KnowledgeManagementService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeManagementServiceImpl.class);
    private final DataSource dataSource;

    public KnowledgeManagementServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getArticles() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, title, category, content, author_id, is_published, created_at " +
                "FROM knowledge_article ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createArticle(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("title");
        String content = (String) body.get("content");
        if (title == null || title.isBlank() || content == null || content.isBlank()) {
            throw new IllegalArgumentException("Article title and content are required.");
        }
        String category = body.get("category") != null ? (String) body.get("category") : "GENERAL";
        Boolean isPublished = body.get("isPublished") != null ? (Boolean) body.get("isPublished") : true;

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO knowledge_article (id, title, category, content, is_published) VALUES (?, ?, ?, ?, ?)",
                id, title.trim(), category, content.trim(), isPublished
        );
        log.info("Knowledge article published: id={} title={}", id, title);
        return Map.of("id", id, "title", title, "category", category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSops() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, sop_title, department, version, file_url, description, created_at " +
                "FROM sop_document ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createSop(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("sopTitle");
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("SOP title is required.");
        }
        String department = body.get("department") != null ? (String) body.get("department") : "HR";
        String version = body.get("version") != null ? (String) body.get("version") : "1.0";
        String fileUrl = (String) body.get("fileUrl");
        String description = (String) body.get("description");

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO sop_document (id, sop_title, department, version, file_url, description) VALUES (?, ?, ?, ?, ?, ?)",
                id, title.trim(), department, version, fileUrl, description
        );
        log.info("SOP document published: id={} title={}", id, title);
        return Map.of("id", id, "sopTitle", title, "version", version);
    }
}
