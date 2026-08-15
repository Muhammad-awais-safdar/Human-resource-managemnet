package com.awais.hr.module.integration;

import com.awais.hr.engine.integration.IntegrationGateway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WebhookIdempotencyTest {

    private final IntegrationGateway integrationGateway = new IntegrationGateway(null);

    @Test
    @DisplayName("Idempotency key generation produces deterministic hash")
    void testIdempotencyKeyFormat() {
        String key = integrationGateway.generateIdempotencyKey("GITHUB", "EVT-9901");
        assertNotNull(key);
        assertTrue(key.contains("GITHUB:EVT-9901"));
    }

    @Test
    @DisplayName("Different provider or event ID produces distinct idempotency key")
    void testDistinctKeys() {
        String key1 = integrationGateway.generateIdempotencyKey("GITHUB", "EVT-9901");
        String key2 = integrationGateway.generateIdempotencyKey("JIRA", "EVT-9901");
        String key3 = integrationGateway.generateIdempotencyKey("GITHUB", "EVT-9902");

        assertNotEquals(key1, key2);
        assertNotEquals(key1, key3);
    }
}
