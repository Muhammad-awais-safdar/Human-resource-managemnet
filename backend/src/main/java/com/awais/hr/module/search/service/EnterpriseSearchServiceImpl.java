package com.awais.hr.module.search.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class EnterpriseSearchServiceImpl implements EnterpriseSearchService {

    private static final Logger log = LoggerFactory.getLogger(EnterpriseSearchServiceImpl.class);
    private final DataSource dataSource;

    public EnterpriseSearchServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> search(String query) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (query == null || query.isBlank()) {
            return jdbc.queryForList("SELECT id, entity_type, entity_id, title, content, created_at FROM search_index_entry ORDER BY created_at DESC LIMIT 20");
        }
        String pattern = "%" + query.trim().toLowerCase() + "%";
        return jdbc.queryForList(
                "SELECT id, entity_type, entity_id, title, content, created_at FROM search_index_entry " +
                "WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(entity_type) LIKE ? ORDER BY created_at DESC",
                pattern, pattern, pattern
        );
    }

    @Override
    public Map<String, Object> indexEntity(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String entityType = (String) body.get("entityType");
        String title = (String) body.get("title");
        if (entityType == null || entityType.isBlank() || title == null || title.isBlank()) {
            throw new IllegalArgumentException("Entity type and title are required.");
        }
        String entityId = body.get("entityId") != null ? (String) body.get("entityId") : UUID.randomUUID().toString();
        String content = (String) body.get("content");

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO search_index_entry (id, entity_type, entity_id, title, content) VALUES (?, ?, ?, ?, ?)",
                id, entityType.toUpperCase().trim(), entityId, title.trim(), content
        );
        log.info("Indexed entity for enterprise search: id={} type={} title={}", id, entityType, title);
        return Map.of("id", id, "entityType", entityType.toUpperCase(), "title", title);
    }
}
