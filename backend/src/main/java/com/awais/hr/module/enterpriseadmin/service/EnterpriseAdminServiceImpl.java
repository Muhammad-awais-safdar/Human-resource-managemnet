package com.awais.hr.module.enterpriseadmin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class EnterpriseAdminServiceImpl implements EnterpriseAdminService {

    private static final Logger log = LoggerFactory.getLogger(EnterpriseAdminServiceImpl.class);
    private final DataSource dataSource;

    public EnterpriseAdminServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAdminSettings() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, maintenance_mode, feature_flags_json, license_type, updated_at FROM enterprise_admin_setting LIMIT 1");
        if (list.isEmpty()) {
            return Map.of("maintenanceMode", false, "featureFlagsJson", "{\"ai_copilot\": true, \"payroll_engine\": true}", "licenseType", "ENTERPRISE_UNLIMITED");
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> updateAdminSettings(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Boolean mm = body.get("maintenanceMode") != null ? (Boolean) body.get("maintenanceMode") : false;
        String ff = body.get("featureFlagsJson") != null ? (String) body.get("featureFlagsJson") : "{}";
        String lic = body.get("licenseType") != null ? (String) body.get("licenseType") : "ENTERPRISE_UNLIMITED";
        if (lic == null || lic.isBlank()) {
            throw new IllegalArgumentException("License type is required.");
        }

        jdbc.update("DELETE FROM enterprise_admin_setting");
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO enterprise_admin_setting (id, maintenance_mode, feature_flags_json, license_type) VALUES (?, ?, ?, ?)",
                id, mm, ff, lic.trim()
        );
        log.info("Enterprise admin settings updated: maintenanceMode={} license={}", mm, lic);
        return Map.of("id", id, "maintenanceMode", mm, "featureFlagsJson", ff, "licenseType", lic);
    }
}
