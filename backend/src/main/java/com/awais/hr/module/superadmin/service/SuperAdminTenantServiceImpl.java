package com.awais.hr.module.superadmin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class SuperAdminTenantServiceImpl implements SuperAdminTenantService {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminTenantServiceImpl.class);
    private final DataSource dataSource;

    public SuperAdminTenantServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogs() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, tenant_name, action_type, details, performed_at FROM super_admin_tenant_log ORDER BY performed_at DESC LIMIT 50");
    }

    @Override
    public Map<String, Object> logTenantAction(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("tenantName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tenant name is required.");
        }
        String action = body.get("actionType") != null ? (String) body.get("actionType") : "PROVISION";
        String details = body.get("details") != null ? (String) body.get("details") : "Super Admin manual operation";

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO super_admin_tenant_log (id, tenant_name, action_type, details) VALUES (?, ?, ?, ?)", id, name.trim(), action, details);
        log.info("Super admin logged tenant action: tenant={} action={}", name, action);
        return Map.of("id", id, "tenantName", name, "actionType", action, "details", details);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTenantDeepDive() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> tenants = jdbc.queryForList(
                "SELECT id, name, subdomain, custom_domain, db_url, status, created_at FROM tenant ORDER BY created_at DESC"
        );

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> t : tenants) {
            Map<String, Object> map = new HashMap<>(t);
            String tenantId = (String) t.get("id");

            // Query subscription data if exists
            List<Map<String, Object>> subs = jdbc.queryForList(
                    "SELECT plan_tier, status, current_period_end FROM subscription WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1",
                    tenantId
            );

            String planTier = "ENTERPRISE";
            String subStatus = (String) t.get("status");
            LocalDateTime periodEnd = LocalDateTime.now().plusDays(30);

            if (!subs.isEmpty()) {
                Map<String, Object> sub = subs.get(0);
                planTier = (String) sub.get("plan_tier");
                subStatus = (String) sub.get("status");
                Object rawEnd = sub.get("current_period_end");
                if (rawEnd instanceof Timestamp ts) {
                    periodEnd = ts.toLocalDateTime();
                }
            }

            long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), periodEnd);
            if (daysRemaining < 0) daysRemaining = 0;

            map.put("planTier", planTier);
            map.put("subscriptionStatus", subStatus);
            map.put("subscriptionExpiresAt", periodEnd.toString());
            map.put("daysRemaining", daysRemaining);

            // Calculate total user accounts associated
            Integer userCount = 0;
            try {
                userCount = jdbc.queryForObject("SELECT COUNT(*) FROM user_account WHERE tenant_id = ?", Integer.class, tenantId);
            } catch (Exception ignored) {}
            map.put("totalUsers", userCount != null ? userCount : 1);

            result.add(map);
        }
        return result;
    }

    @Override
    public Map<String, Object> updateTenantStatus(String tenantId, String status) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        int updated = jdbc.update("UPDATE tenant SET status = ?, updated_at = NOW() WHERE id = ?", status, tenantId);
        if (updated == 0) {
            throw new IllegalArgumentException("Tenant not found with ID: " + tenantId);
        }

        // Also update subscription record status
        try {
            jdbc.update("UPDATE subscription SET status = ? WHERE tenant_id = ?", status, tenantId);
        } catch (Exception ignored) {}

        log.info("Super Admin updated tenant status: tenantId={} status={}", tenantId, status);
        return Map.of("success", true, "tenantId", tenantId, "status", status);
    }

    @Override
    public Map<String, Object> extendTenantSubscription(String tenantId, int days) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        List<Map<String, Object>> subs = jdbc.queryForList(
                "SELECT id, current_period_end FROM subscription WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1",
                tenantId
        );

        LocalDateTime newEnd = LocalDateTime.now().plusDays(days > 0 ? days : 30);
        if (!subs.isEmpty()) {
            String subId = (String) subs.get(0).get("id");
            jdbc.update("UPDATE subscription SET current_period_end = ?, status = 'ACTIVE' WHERE id = ?", Timestamp.valueOf(newEnd), subId);
        } else {
            String subId = UUID.randomUUID().toString();
            jdbc.update(
                    "INSERT INTO subscription (id, tenant_id, plan_tier, status, current_period_start, current_period_end) VALUES (?, ?, 'ENTERPRISE', 'ACTIVE', NOW(), ?)",
                    subId, tenantId, Timestamp.valueOf(newEnd)
            );
        }

        jdbc.update("UPDATE tenant SET status = 'ACTIVE', updated_at = NOW() WHERE id = ?", tenantId);

        log.info("Super Admin extended tenant subscription: tenantId={} extendedBy={} days newEnd={}", tenantId, days, newEnd);
        return Map.of("success", true, "tenantId", tenantId, "extendedDays", days, "newExpiresAt", newEnd.toString());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTenantUsers(String tenantId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        try {
            return jdbc.queryForList(
                    "SELECT u.id, u.email, u.role, u.active, u.created_at, e.first_name, e.last_name, e.job_title " +
                    "FROM user_account u LEFT JOIN employee e ON u.email = e.email WHERE u.tenant_id = ? ORDER BY u.created_at DESC",
                    tenantId
            );
        } catch (Exception e) {
            return List.of();
        }
    }
}

