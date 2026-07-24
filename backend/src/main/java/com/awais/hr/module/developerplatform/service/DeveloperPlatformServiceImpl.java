package com.awais.hr.module.developerplatform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class DeveloperPlatformServiceImpl implements DeveloperPlatformService {

    private static final Logger log = LoggerFactory.getLogger(DeveloperPlatformServiceImpl.class);
    private final DataSource dataSource;

    public DeveloperPlatformServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWebhooks() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, event_type, target_url, secret_key, status, created_at FROM webhook_subscription ORDER BY created_at DESC");
    }

    @Override
    public Map<String, Object> registerWebhook(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String eventType = (String) body.get("eventType");
        String targetUrl = (String) body.get("targetUrl");
        if (eventType == null || eventType.isBlank() || targetUrl == null || targetUrl.isBlank()) {
            throw new IllegalArgumentException("Event type and Target URL are required.");
        }
        String id = UUID.randomUUID().toString();
        String secret = "whsec_" + UUID.randomUUID().toString().replace("-", "");
        jdbc.update("INSERT INTO webhook_subscription (id, event_type, target_url, secret_key, status) VALUES (?, ?, ?, ?, 'ACTIVE')", id, eventType.trim(), targetUrl.trim(), secret);
        log.info("Webhook registered: id={} event={} target={}", id, eventType, targetUrl);
        return Map.of("id", id, "eventType", eventType, "targetUrl", targetUrl, "secretKey", secret);
    }
}
