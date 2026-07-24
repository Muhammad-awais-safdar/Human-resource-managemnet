package com.awais.hr.module.mobileenterprise.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class MobileEnterpriseServiceImpl implements MobileEnterpriseService {

    private static final Logger log = LoggerFactory.getLogger(MobileEnterpriseServiceImpl.class);
    private final DataSource dataSource;

    public MobileEnterpriseServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDevices() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, device_name, os_type, push_token, is_biometric, status, registered_at FROM mobile_device_registration ORDER BY registered_at DESC");
    }

    @Override
    public Map<String, Object> registerDevice(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("deviceName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Device name is required.");
        }
        String os = body.get("osType") != null ? (String) body.get("osType") : "ANDROID";
        String token = body.get("pushToken") != null ? (String) body.get("pushToken") : "fcm_token_" + UUID.randomUUID().toString().substring(0, 8);
        Boolean bio = body.get("isBiometric") != null ? (Boolean) body.get("isBiometric") : true;

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO mobile_device_registration (id, device_name, os_type, push_token, is_biometric, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')", id, name.trim(), os.toUpperCase(), token, bio);
        log.info("Mobile device registered: id={} name={} os={}", id, name, os);
        return Map.of("id", id, "deviceName", name, "osType", os.toUpperCase(), "pushToken", token, "isBiometric", bio, "status", "ACTIVE");
    }
}
