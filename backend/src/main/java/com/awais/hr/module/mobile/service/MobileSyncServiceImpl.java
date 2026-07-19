package com.awais.hr.module.mobile.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class MobileSyncServiceImpl implements MobileSyncService {

    private static final Logger log = LoggerFactory.getLogger(MobileSyncServiceImpl.class);
    private final DataSource dataSource;

    public MobileSyncServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void registerDevice(String email, String deviceToken, String platform, String clientVersion) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (deviceToken == null || deviceToken.isBlank()) throw new IllegalArgumentException("Device token is required.");
        if (platform == null || platform.isBlank()) throw new IllegalArgumentException("Platform (ANDROID/IOS) is required.");

        String empId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        String plat = platform.toUpperCase().trim();

        Integer exists = jdbc.queryForObject(
                "SELECT COUNT(1) FROM mobile_device_sync WHERE device_token = ? AND deleted = FALSE",
                Integer.class, deviceToken
        );
        if (exists != null && exists > 0) {
            jdbc.update(
                    "UPDATE mobile_device_sync SET client_version = ?, last_sync_at = NOW() WHERE device_token = ?",
                    clientVersion, deviceToken
            );
            log.info("Mobile device updated: token={} employee={}", deviceToken.substring(0, 8) + "...", email);
        } else {
            jdbc.update(
                    "INSERT INTO mobile_device_sync (id, employee_id, device_token, platform, client_version, last_sync_at) VALUES (?, ?, ?, ?, ?, NOW())",
                    UUID.randomUUID().toString(), empId, deviceToken, plat, clientVersion
            );
            log.info("Mobile device registered: platform={} employee={}", plat, email);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> syncDelta(String deviceToken, String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);

        // Build a comprehensive delta payload for offline state
        List<Map<String, Object>> pendingLeaves = jdbc.queryForList(
                "SELECT id, leave_type, start_date, end_date, status FROM leave_request WHERE employee_id = ? AND status = 'PENDING' AND deleted = FALSE",
                empId
        );
        List<Map<String, Object>> notifications = jdbc.queryForList(
                "SELECT id, title, message, category, is_read, created_at FROM notification_queue WHERE employee_id = ? AND is_read = FALSE AND deleted = FALSE LIMIT 20",
                empId
        );
        Map<String, Object> profile = jdbc.queryForMap(
                "SELECT id, first_name, last_name, email, phone, job_title, department_id FROM employee WHERE id = ? AND deleted = FALSE",
                empId
        );

        // Update last_sync_at
        jdbc.update("UPDATE mobile_device_sync SET last_sync_at = NOW() WHERE device_token = ?", deviceToken);

        String syncTimestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        Map<String, Object> delta = new LinkedHashMap<>();
        delta.put("syncTimestamp", syncTimestamp);
        delta.put("profile", profile);
        delta.put("pendingLeaves", pendingLeaves);
        delta.put("unreadNotifications", notifications);

        log.info("Mobile sync delta delivered: device={} employee={} leaves={} notifications={}",
                deviceToken.substring(0, 8) + "...", email, pendingLeaves.size(), notifications.size());
        return delta;
    }

    @Override
    public void pushDelta(String deviceToken, String syncDeltaJson) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (deviceToken == null || deviceToken.isBlank()) throw new IllegalArgumentException("Device token is required.");
        if (syncDeltaJson == null || syncDeltaJson.isBlank()) throw new IllegalArgumentException("Sync delta JSON is required.");

        jdbc.update(
                "UPDATE mobile_device_sync SET sync_delta_json = ?, last_sync_at = NOW() WHERE device_token = ? AND deleted = FALSE",
                syncDeltaJson, deviceToken
        );
        log.info("Mobile delta pushed: device={}", deviceToken.substring(0, 8) + "...");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDevicesForEmployee(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        return jdbc.queryForList(
                "SELECT id, platform, client_version, last_sync_at, created_at FROM mobile_device_sync WHERE employee_id = ? AND deleted = FALSE ORDER BY last_sync_at DESC",
                empId
        );
    }

    @Override
    public void deregisterDevice(String deviceToken) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("UPDATE mobile_device_sync SET deleted = TRUE WHERE device_token = ?", deviceToken);
        log.info("Mobile device deregistered: token={}", deviceToken.substring(0, 8) + "...");
    }
}
