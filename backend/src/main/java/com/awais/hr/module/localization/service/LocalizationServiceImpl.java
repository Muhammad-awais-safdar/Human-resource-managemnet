package com.awais.hr.module.localization.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class LocalizationServiceImpl implements LocalizationService {

    private static final Logger log = LoggerFactory.getLogger(LocalizationServiceImpl.class);
    private final DataSource dataSource;

    public LocalizationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getLocaleSettings() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, default_language, time_zone, date_format, currency_code, is_rtl_supported, updated_at FROM tenant_locale_setting LIMIT 1");
        if (list.isEmpty()) {
            return Map.of("defaultLanguage", "en-US", "timeZone", "UTC", "dateFormat", "YYYY-MM-DD", "currencyCode", "USD", "isRtlSupported", false);
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> updateLocaleSettings(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String lang = (String) body.get("defaultLanguage");
        if (lang == null || lang.isBlank()) {
            throw new IllegalArgumentException("Default language code is required.");
        }
        String tz = body.get("timeZone") != null ? (String) body.get("timeZone") : "UTC";
        String df = body.get("dateFormat") != null ? (String) body.get("dateFormat") : "YYYY-MM-DD";
        String cur = body.get("currencyCode") != null ? (String) body.get("currencyCode") : "USD";
        Boolean rtl = body.get("isRtlSupported") != null ? (Boolean) body.get("isRtlSupported") : false;

        jdbc.update("DELETE FROM tenant_locale_setting");
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO tenant_locale_setting (id, default_language, time_zone, date_format, currency_code, is_rtl_supported) VALUES (?, ?, ?, ?, ?, ?)",
                id, lang.trim(), tz, df, cur, rtl
        );
        log.info("Locale settings updated: lang={} tz={} cur={}", lang, tz, cur);
        return Map.of("id", id, "defaultLanguage", lang, "timeZone", tz, "currencyCode", cur, "isRtlSupported", rtl);
    }
}
