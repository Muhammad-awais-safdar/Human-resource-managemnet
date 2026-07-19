package com.awais.hr.module.integration.service;

import java.util.List;
import java.util.Map;

public interface IntegrationService {
    List<Map<String, Object>> getIntegrations();
    void upsertIntegration(String provider, String clientId, String clientSecret, String settingsJson);
    void toggleIntegration(String id, boolean active);
    List<Map<String, Object>> getWebhooks();
    void addWebhook(String targetUrl, String description, String secret, String eventsJson);
    void deleteWebhook(String id);
    void dispatchWebhook(String event, Map<String, Object> payload);
}
