package com.awais.hr.module.accessibility.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class AccessibilityServiceImpl implements AccessibilityService {

    private static final Logger log = LoggerFactory.getLogger(AccessibilityServiceImpl.class);
    private final DataSource dataSource;

    public AccessibilityServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPreferences() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, high_contrast, screen_reader_optimized, font_scale_percent, updated_at FROM accessibility_preference LIMIT 1");
        if (list.isEmpty()) {
            return Map.of("highContrast", false, "screenReaderOptimized", true, "fontScalePercent", 100);
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> updatePreferences(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Boolean hc = body.get("highContrast") != null ? (Boolean) body.get("highContrast") : false;
        Boolean sr = body.get("screenReaderOptimized") != null ? (Boolean) body.get("screenReaderOptimized") : true;
        Number fsNum = (Number) body.getOrDefault("fontScalePercent", 100);
        int fs = fsNum.intValue();
        if (fs < 50 || fs > 200) {
            throw new IllegalArgumentException("Font scale percent must be between 50 and 200.");
        }

        jdbc.update("DELETE FROM accessibility_preference");
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO accessibility_preference (id, high_contrast, screen_reader_optimized, font_scale_percent) VALUES (?, ?, ?, ?)",
                id, hc, sr, fs
        );
        log.info("Accessibility preferences updated: highContrast={} fontScale={}%", hc, fs);
        return Map.of("id", id, "highContrast", hc, "screenReaderOptimized", sr, "fontScalePercent", fs);
    }
}
