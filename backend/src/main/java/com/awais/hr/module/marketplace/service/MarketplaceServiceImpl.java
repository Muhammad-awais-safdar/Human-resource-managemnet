package com.awais.hr.module.marketplace.service;

import com.awais.hr.module.marketplace.sandbox.PluginSandboxEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.File;
import java.util.*;

@Service
@Transactional
public class MarketplaceServiceImpl implements MarketplaceService {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceServiceImpl.class);
    private final DataSource dataSource;
    private final PluginSandboxEngine pluginSandboxEngine;

    public MarketplaceServiceImpl(DataSource dataSource) {
        this(dataSource, new PluginSandboxEngine());
    }

    @org.springframework.beans.factory.annotation.Autowired
    public MarketplaceServiceImpl(DataSource dataSource, PluginSandboxEngine pluginSandboxEngine) {
        this.dataSource = dataSource;
        this.pluginSandboxEngine = pluginSandboxEngine;
    }



    private void ensureTableExists(JdbcTemplate jdbc) {
        try {
            jdbc.execute("CREATE TABLE IF NOT EXISTS marketplace_plugin (" +
                    "id VARCHAR(36) PRIMARY KEY, " +
                    "plugin_name VARCHAR(100) NOT NULL, " +
                    "vendor VARCHAR(100) NOT NULL DEFAULT 'COMMUNITY', " +
                    "version VARCHAR(20) NOT NULL DEFAULT '1.0.0', " +
                    "is_installed BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "created_at TIMESTAMP NOT NULL DEFAULT NOW())");

            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM marketplace_plugin", Integer.class);
            if (count != null && count == 0) {
                jdbc.execute("INSERT INTO marketplace_plugin (id, plugin_name, vendor, version, is_installed) VALUES " +
                        "('" + UUID.randomUUID() + "', 'Slack HR Notifications', 'COMMUNITY', '2.1.0', true), " +
                        "('" + UUID.randomUUID() + "', 'Jira Work Sync', 'COMMUNITY', '1.4.0', true), " +
                        "('" + UUID.randomUUID() + "', 'Zoom Interview Integration', 'COMMUNITY', '1.2.0', false), " +
                        "('" + UUID.randomUUID() + "', 'AI Resume Parser', 'COMMUNITY', '3.0.0', true)");
            }
        } catch (Exception e) {
            log.warn("Marketplace plugin table check/seed: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPlugins() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc);
        return jdbc.queryForList("SELECT id, plugin_name, vendor, version, is_installed, created_at FROM marketplace_plugin ORDER BY created_at DESC");
    }

    @Override
    public Map<String, Object> installPlugin(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc);
        String name = (String) body.get("pluginName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Plugin name is required.");
        }
        String vendor = body.get("vendor") != null ? (String) body.get("vendor") : "COMMUNITY";
        String version = body.get("version") != null ? (String) body.get("version") : "1.0.0";

        // Check if plugin is already registered
        List<Map<String, Object>> existing = jdbc.queryForList("SELECT id FROM marketplace_plugin WHERE LOWER(plugin_name) = LOWER(?)", name.trim());
        if (!existing.isEmpty()) {
            String existingId = (String) existing.get(0).get("id");
            jdbc.update("UPDATE marketplace_plugin SET is_installed = TRUE, version = ?, vendor = ? WHERE id = ?", version, vendor, existingId);
            log.info("Marketplace plugin updated/re-activated: id={} name={}", existingId, name);
            return Map.of("id", existingId, "pluginName", name, "vendor", vendor, "version", version, "isInstalled", true);
        }

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO marketplace_plugin (id, plugin_name, vendor, version, is_installed) VALUES (?, ?, ?, ?, TRUE)", id, name.trim(), vendor, version);
        log.info("Marketplace plugin installed: id={} name={}", id, name);
        return Map.of("id", id, "pluginName", name, "vendor", vendor, "version", version, "isInstalled", true);
    }

    @Override
    public Map<String, Object> togglePlugin(String id, boolean enabled) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc);
        int updated = jdbc.update("UPDATE marketplace_plugin SET is_installed = ? WHERE id = ?", enabled, id);
        if (updated == 0) {
            throw new IllegalArgumentException("Plugin not found with ID: " + id);
        }
        log.info("Marketplace plugin toggled: id={} isInstalled={}", id, enabled);
        return Map.of("id", id, "isInstalled", enabled);
    }

    @Override
    public Map<String, Object> uninstallPlugin(String id) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc);
        int updated = jdbc.update("DELETE FROM marketplace_plugin WHERE id = ?", id);
        if (updated == 0) {
            throw new IllegalArgumentException("Plugin not found with ID: " + id);
        }
        log.info("Marketplace plugin uninstalled: id={}", id);
        return Map.of("success", true, "id", id, "message", "Plugin successfully uninstalled.");
    }

    @Override
    public Map<String, Object> uploadAndInstallPluginBundle(File tempFile, String originalFilename) {
        PluginSandboxEngine.SandboxValidationResult validation = pluginSandboxEngine.validatePluginBundle(tempFile);
        if (!validation.isValid()) {
            throw new IllegalArgumentException(validation.getMessage());
        }

        Map<String, Object> details = validation.getManifestDetails();
        String pluginName = details != null && details.get("pluginName") != null ? (String) details.get("pluginName") : originalFilename.replace(".zip", "");
        String vendor = details != null && details.get("vendor") != null ? (String) details.get("vendor") : "Custom Developer";
        String version = details != null && details.get("version") != null ? (String) details.get("version") : "1.0.0";

        Map<String, Object> installResult = installPlugin(Map.of(
            "pluginName", pluginName,
            "vendor", vendor,
            "version", version
        ));

        log.info("Uploaded plugin bundle verified by sandbox and registered into marketplace: name={}", pluginName);
        return Map.of(
            "success", true,
            "message", "Plugin bundle passed security sandbox inspection and was successfully installed!",
            "plugin", installResult
        );
    }
}
