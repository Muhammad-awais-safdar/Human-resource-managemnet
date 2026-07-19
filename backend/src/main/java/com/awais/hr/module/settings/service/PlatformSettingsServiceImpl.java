package com.awais.hr.module.settings.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PlatformSettingsServiceImpl implements PlatformSettingsService {

    private static final Logger log = LoggerFactory.getLogger(PlatformSettingsServiceImpl.class);
    private final DataSource dataSource;
    private static final String DEFAULT_ID = "default-settings-id-001";

    public PlatformSettingsServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "platform_settings", key = "'global'")
    public Map<String, Object> getSettings() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList(
                "SELECT company_name, primary_color, logo_url, support_email, currency, timezone, date_format FROM platform_settings WHERE id = ?",
                DEFAULT_ID
        );
        if (list.isEmpty()) {
            return Map.of(
                    "company_name", "Awais HR Corp",
                    "primary_color", "#6366f1",
                    "logo_url", "",
                    "support_email", "support@company.com",
                    "currency", "USD",
                    "timezone", "UTC",
                    "date_format", "yyyy-MM-dd"
            );
        }
        return list.get(0);
    }

    @Override
    @CacheEvict(value = "platform_settings", allEntries = true)
    public void updateSettings(Map<String, String> settings) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        String companyName = settings.getOrDefault("companyName", "Awais HR Corp");
        String primaryColor = settings.getOrDefault("primaryColor", "#6366f1");
        String logoUrl = settings.get("logoUrl");
        String supportEmail = settings.getOrDefault("supportEmail", "support@company.com");
        String currency = settings.getOrDefault("currency", "USD");
        String timezone = settings.getOrDefault("timezone", "UTC");
        String dateFormat = settings.getOrDefault("dateFormat", "yyyy-MM-dd");

        int rows = jdbc.update(
                "UPDATE platform_settings SET company_name = ?, primary_color = ?, logo_url = ?, support_email = ?, currency = ?, timezone = ?, date_format = ?, updated_at = NOW() WHERE id = ?",
                companyName.trim(), primaryColor.trim(), logoUrl, supportEmail.trim(), currency.trim(), timezone.trim(), dateFormat.trim(), DEFAULT_ID
        );

        if (rows == 0) {
            // fallback if seed row is missing somehow
            jdbc.update(
                    "INSERT INTO platform_settings (id, company_name, primary_color, logo_url, support_email, currency, timezone, date_format) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    DEFAULT_ID, companyName.trim(), primaryColor.trim(), logoUrl, supportEmail.trim(), currency.trim(), timezone.trim(), dateFormat.trim()
            );
        }
        log.info("Platform settings updated: companyName={} primaryColor={}", companyName, primaryColor);
    }
}
