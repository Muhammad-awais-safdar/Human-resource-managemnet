package com.awais.hr.engine.integration;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.util.*;

@Service
public class IntegrationGateway {

    private final DataSource dataSource;

    public IntegrationGateway(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean processWebhook(String provider, String externalEventId, String eventType, String rawPayload) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        // Idempotency check: provider + externalEventId must be unique
        Integer existingCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM integration_webhook_event WHERE provider = ? AND external_event_id = ?",
                Integer.class, provider, externalEventId
        );

        if (existingCount != null && existingCount > 0) {
            // Already processed
            return false;
        }

        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO integration_webhook_event (id, provider, external_event_id, event_type, payload, status) " +
                "VALUES (?, ?, ?, ?, ?, 'PROCESSED')",
                id, provider, externalEventId, eventType, rawPayload
        );
        return true;
    }

    public List<Map<String, Object>> getWebhookEvents(String provider) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, provider, external_event_id, event_type, status, processed_at " +
                "FROM integration_webhook_event WHERE provider = ? ORDER BY processed_at DESC LIMIT 50",
                provider
        );
    }
}
