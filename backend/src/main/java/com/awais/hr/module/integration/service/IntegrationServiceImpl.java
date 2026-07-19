package com.awais.hr.module.integration.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.sql.DataSource;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Transactional
public class IntegrationServiceImpl implements IntegrationService {

    private static final Logger log = LoggerFactory.getLogger(IntegrationServiceImpl.class);
    private final DataSource dataSource;
    private final HttpClient httpClient;

    public IntegrationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getIntegrations() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, provider, active, created_at, updated_at FROM integration_config WHERE deleted = FALSE ORDER BY provider"
        );
    }

    @Override
    public void upsertIntegration(String provider, String clientId, String clientSecret, String settingsJson) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (provider == null || provider.isBlank()) throw new IllegalArgumentException("Provider is required.");
        String prov = provider.toUpperCase().trim();

        Integer exists = jdbc.queryForObject(
                "SELECT COUNT(1) FROM integration_config WHERE provider = ? AND deleted = FALSE", Integer.class, prov
        );
        if (exists != null && exists > 0) {
            jdbc.update(
                    "UPDATE integration_config SET client_id = ?, client_secret = ?, settings_json = ?, updated_at = NOW() WHERE provider = ? AND deleted = FALSE",
                    clientId, clientSecret, settingsJson, prov
            );
            log.info("Integration updated: provider={}", prov);
        } else {
            jdbc.update(
                    "INSERT INTO integration_config (id, provider, client_id, client_secret, settings_json) VALUES (?, ?, ?, ?, ?)",
                    UUID.randomUUID().toString(), prov, clientId, clientSecret, settingsJson
            );
            log.info("Integration created: provider={}", prov);
        }
    }

    @Override
    public void toggleIntegration(String id, boolean active) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("UPDATE integration_config SET active = ?, updated_at = NOW() WHERE id = ?", active, id);
        log.info("Integration toggled: id={} active={}", id, active);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWebhooks() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, target_url, description, events_json, active, last_triggered, created_at " +
                "FROM webhook_endpoint WHERE deleted = FALSE ORDER BY created_at DESC"
        );
    }

    @Override
    public void addWebhook(String targetUrl, String description, String secret, String eventsJson) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (targetUrl == null || targetUrl.isBlank()) throw new IllegalArgumentException("Target URL is required.");
        if (!targetUrl.startsWith("https://")) throw new IllegalArgumentException("Webhook URL must use HTTPS.");
        if (eventsJson == null || eventsJson.isBlank()) throw new IllegalArgumentException("Events JSON is required.");

        jdbc.update(
                "INSERT INTO webhook_endpoint (id, target_url, description, secret, events_json) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), targetUrl.trim(), description, secret, eventsJson
        );
        log.info("Webhook registered: url={}", targetUrl);
    }

    @Override
    public void deleteWebhook(String id) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("UPDATE webhook_endpoint SET deleted = TRUE WHERE id = ?", id);
        log.info("Webhook deleted: id={}", id);
    }

    @Override
    public void dispatchWebhook(String event, Map<String, Object> payload) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        // Fetch all active webhooks that subscribe to this event
        List<Map<String, Object>> endpoints = jdbc.queryForList(
                "SELECT id, target_url, secret, events_json FROM webhook_endpoint WHERE active = TRUE AND deleted = FALSE"
        );

        String payloadJson = buildJson(payload);

        for (Map<String, Object> ep : endpoints) {
            String eventsJson = (String) ep.get("events_json");
            // Only dispatch if this event is in the subscribed list
            if (eventsJson == null || !eventsJson.contains("\"" + event + "\"")) continue;

            String url = (String) ep.get("target_url");
            String secret = (String) ep.get("secret");
            String epId = (String) ep.get("id");

            try {
                HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .header("X-HR-Event", event);

                // HMAC-SHA256 signature for webhook security
                if (secret != null && !secret.isBlank()) {
                    String signature = hmacSha256(payloadJson, secret);
                    reqBuilder.header("X-HR-Signature", "sha256=" + signature);
                }

                HttpRequest req = reqBuilder.POST(HttpRequest.BodyPublishers.ofString(payloadJson)).build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

                jdbc.update("UPDATE webhook_endpoint SET last_triggered = NOW() WHERE id = ?", epId);
                log.info("Webhook dispatched: id={} url={} event={} status={}", epId, url, event, resp.statusCode());
            } catch (Exception e) {
                log.error("Webhook dispatch failed: id={} url={} event={} error={}", epId, url, event, e.getMessage());
            }
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) hex.append(String.format("%02x", b));
        return hex.toString();
    }

    private String buildJson(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return "{}";
        StringBuilder sb = new StringBuilder("{");
        map.forEach((k, v) -> {
            sb.append("\"").append(k.replace("\"", "\\\"")).append("\":");
            if (v instanceof String s) sb.append("\"").append(s.replace("\"", "\\\"")).append("\"");
            else sb.append(v);
            sb.append(",");
        });
        if (sb.charAt(sb.length() - 1) == ',') sb.deleteCharAt(sb.length() - 1);
        sb.append("}");
        return sb.toString();
    }
}
