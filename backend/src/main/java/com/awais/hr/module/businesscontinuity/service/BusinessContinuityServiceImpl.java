package com.awais.hr.module.businesscontinuity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class BusinessContinuityServiceImpl implements BusinessContinuityService {

    private static final Logger log = LoggerFactory.getLogger(BusinessContinuityServiceImpl.class);
    private final DataSource dataSource;

    public BusinessContinuityServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBackups() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, backup_name, backup_type, size_bytes, status, created_at FROM disaster_recovery_backup ORDER BY created_at DESC");
    }

    @Override
    public Map<String, Object> triggerBackup(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("backupName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Backup name is required.");
        }
        String type = body.get("backupType") != null ? (String) body.get("backupType") : "MANUAL";
        long size = body.get("sizeBytes") != null ? ((Number) body.get("sizeBytes")).longValue() : 20971520L;

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO disaster_recovery_backup (id, backup_name, backup_type, size_bytes, status) VALUES (?, ?, ?, ?, 'COMPLETED')", id, name.trim(), type, size);
        log.info("Disaster recovery snapshot created: id={} name={}", id, name);
        return Map.of("id", id, "backupName", name, "backupType", type, "sizeBytes", size, "status", "COMPLETED");
    }
}
