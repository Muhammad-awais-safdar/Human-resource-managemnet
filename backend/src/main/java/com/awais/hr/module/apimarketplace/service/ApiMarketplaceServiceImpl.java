package com.awais.hr.module.apimarketplace.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ApiMarketplaceServiceImpl implements ApiMarketplaceService {

    private static final Logger log = LoggerFactory.getLogger(ApiMarketplaceServiceImpl.class);
    private final DataSource dataSource;

    public ApiMarketplaceServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private void ensureTableExists(JdbcTemplate jdbc) {
        try {
            jdbc.execute("CREATE TABLE IF NOT EXISTS api_key (" +
                    "id VARCHAR(64) PRIMARY KEY, " +
                    "key_name VARCHAR(255) NOT NULL, " +
                    "api_key VARCHAR(255) NOT NULL UNIQUE, " +
                    "status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")");
        } catch (Exception e) {
            log.warn("Could not create api_key table automatically: {}", e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> getApiKeys() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc);
        return jdbc.queryForList("SELECT id, key_name, api_key, status, created_at FROM api_key ORDER BY created_at DESC");
    }

    @Override
    public Map<String, Object> generateApiKey(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc);
        String name = (String) body.get("keyName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("API Key name is required.");
        }
        String id = UUID.randomUUID().toString();
        String generatedKey = "ak_live_" + UUID.randomUUID().toString().replace("-", "");
        jdbc.update("INSERT INTO api_key (id, key_name, api_key, status) VALUES (?, ?, ?, 'ACTIVE')", id, name.trim(), generatedKey);
        log.info("API Key generated: id={} name={}", id, name);
        return Map.of("id", id, "keyName", name, "apiKey", generatedKey, "status", "ACTIVE");
    }
}
