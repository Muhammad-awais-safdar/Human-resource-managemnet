package com.awais.hr.module.platformoperations.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class PlatformOperationsServiceImpl implements PlatformOperationsService {

    private static final Logger log = LoggerFactory.getLogger(PlatformOperationsServiceImpl.class);
    private final DataSource dataSource;

    public PlatformOperationsServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogs() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, operation_name, module_name, execution_time_ms, status, created_at FROM platform_operation_log ORDER BY created_at DESC LIMIT 50");
    }

    @Override
    public Map<String, Object> recordLog(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("operationName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Operation name is required.");
        }
        String module = body.get("moduleName") != null ? (String) body.get("moduleName") : "SYSTEM";
        int timeMs = body.get("executionTimeMs") != null ? ((Number) body.get("executionTimeMs")).intValue() : 25;

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO platform_operation_log (id, operation_name, module_name, execution_time_ms, status) VALUES (?, ?, ?, ?, 'SUCCESS')", id, name.trim(), module, timeMs);
        log.info("Platform operation logged: id={} op={} time={}ms", id, name, timeMs);
        return Map.of("id", id, "operationName", name, "moduleName", module, "executionTimeMs", timeMs, "status", "SUCCESS");
    }
}
