package com.awais.hr.module.superadmin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
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
}
