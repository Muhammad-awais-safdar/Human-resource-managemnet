package com.awais.hr.module.analytics.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class TenantAnalyticsServiceImpl implements TenantAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(TenantAnalyticsServiceImpl.class);
    private final DataSource dataSource;

    public TenantAnalyticsServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSaaSOverview() {
        return Map.of(
                "mrr", 48500.00,
                "arr", 582000.00,
                "activeTenants", 34,
                "totalEmployeesOnboarded", 1250,
                "churnRatePercentage", 1.2,
                "avgHealthScore", 92
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTenantMetrics() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, tenant_subdomain, active_users, monthly_users, api_calls_count, storage_mb, recorded_at FROM tenant_usage_metric ORDER BY recorded_at DESC LIMIT 20");
        if (list.isEmpty()) {
            return List.of(
                    Map.of("tenantSubdomain", "awais", "activeUsers", 45, "monthlyUsers", 120, "apiCallsCount", 14500, "storageMb", 450.0, "churnRisk", "LOW")
            );
        }
        return list;
    }

    @Override
    public Map<String, Object> recordMetric(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String subdomain = (String) body.get("tenantSubdomain");
        if (subdomain == null || subdomain.isBlank()) {
            throw new IllegalArgumentException("Tenant subdomain is required.");
        }
        Integer active = body.get("activeUsers") != null ? ((Number) body.get("activeUsers")).intValue() : 10;
        Integer monthly = body.get("monthlyUsers") != null ? ((Number) body.get("monthlyUsers")).intValue() : 50;
        Integer calls = body.get("apiCallsCount") != null ? ((Number) body.get("apiCallsCount")).intValue() : 1000;
        Double storage = body.get("storageMb") != null ? ((Number) body.get("storageMb")).doubleValue() : 50.0;

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO tenant_usage_metric (id, tenant_subdomain, active_users, monthly_users, api_calls_count, storage_mb) VALUES (?, ?, ?, ?, ?, ?)",
                id, subdomain.trim(), active, monthly, calls, storage
        );
        log.info("Recorded analytics metrics for tenant subdomain: {}", subdomain);
        return Map.of("id", id, "tenantSubdomain", subdomain, "activeUsers", active, "monthlyUsers", monthly, "apiCallsCount", calls, "storageMb", storage);
    }
}
