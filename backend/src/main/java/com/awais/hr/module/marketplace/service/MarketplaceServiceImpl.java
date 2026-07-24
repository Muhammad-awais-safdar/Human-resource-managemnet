package com.awais.hr.module.marketplace.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class MarketplaceServiceImpl implements MarketplaceService {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceServiceImpl.class);
    private final DataSource dataSource;

    public MarketplaceServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPlugins() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, plugin_name, vendor, version, is_installed, created_at FROM marketplace_plugin ORDER BY created_at DESC");
    }

    @Override
    public Map<String, Object> installPlugin(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("pluginName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Plugin name is required.");
        }
        String vendor = body.get("vendor") != null ? (String) body.get("vendor") : "COMMUNITY";
        String version = body.get("version") != null ? (String) body.get("version") : "1.0.0";

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO marketplace_plugin (id, plugin_name, vendor, version, is_installed) VALUES (?, ?, ?, ?, TRUE)", id, name.trim(), vendor, version);
        log.info("Marketplace plugin installed: id={} name={}", id, name);
        return Map.of("id", id, "pluginName", name, "vendor", vendor, "isInstalled", true);
    }
}
