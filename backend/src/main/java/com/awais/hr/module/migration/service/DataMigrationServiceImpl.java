package com.awais.hr.module.migration.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class DataMigrationServiceImpl implements DataMigrationService {

    private static final Logger log = LoggerFactory.getLogger(DataMigrationServiceImpl.class);
    private final DataSource dataSource;

    public DataMigrationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMigrationJobs() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, source_system, target_entity, total_records, successful_records, failed_records, status, created_at " +
                "FROM data_migration_job ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> executeMigrationJob(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String sourceSystem = body.get("sourceSystem") != null ? (String) body.get("sourceSystem") : "CSV_IMPORT";
        String targetEntity = body.get("targetEntity") != null ? (String) body.get("targetEntity") : "EMPLOYEE";
        Number countNum = (Number) body.getOrDefault("totalRecords", 10);
        int total = countNum.intValue();
        if (total <= 0) {
            throw new IllegalArgumentException("Total records must be greater than zero.");
        }

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO data_migration_job (id, source_system, target_entity, total_records, successful_records, failed_records, status) VALUES (?, ?, ?, ?, ?, 0, 'COMPLETED')",
                id, sourceSystem, targetEntity, total, total
        );
        log.info("Migration job executed: id={} source={} count={}", id, sourceSystem, total);
        return Map.of("id", id, "sourceSystem", sourceSystem, "targetEntity", targetEntity, "successfulRecords", total, "status", "COMPLETED");
    }
}
