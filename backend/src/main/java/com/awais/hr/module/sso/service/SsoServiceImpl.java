package com.awais.hr.module.sso.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class SsoServiceImpl implements SsoService {

    private static final Logger log = LoggerFactory.getLogger(SsoServiceImpl.class);
    private final DataSource dataSource;

    public SsoServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSsoConfig() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, idp_name, sso_url, entity_id, is_enforced, scim_enabled, updated_at FROM tenant_sso_config LIMIT 1");
        if (list.isEmpty()) {
            return Map.of("idpName", "OKTA", "ssoUrl", "https://dev-12345.okta.com/app/sso", "entityId", "urn:workforceos:sp", "isEnforced", false, "scimEnabled", true);
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> updateSsoConfig(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String ssoUrl = (String) body.get("ssoUrl");
        if (ssoUrl == null || ssoUrl.isBlank()) {
            throw new IllegalArgumentException("SSO Target URL is required.");
        }
        String idp = body.get("idpName") != null ? (String) body.get("idpName") : "OKTA";
        String entityId = body.get("entityId") != null ? (String) body.get("entityId") : "urn:workforceos:sp";
        Boolean enforced = body.get("isEnforced") != null ? (Boolean) body.get("isEnforced") : false;
        Boolean scim = body.get("scimEnabled") != null ? (Boolean) body.get("scimEnabled") : true;

        jdbc.update("DELETE FROM tenant_sso_config");
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO tenant_sso_config (id, idp_name, sso_url, entity_id, is_enforced, scim_enabled) VALUES (?, ?, ?, ?, ?, ?)",
                id, idp, ssoUrl.trim(), entityId, enforced, scim
        );
        log.info("SSO Configuration updated: idp={} url={}", idp, ssoUrl);
        return Map.of("id", id, "idpName", idp, "ssoUrl", ssoUrl, "entityId", entityId, "isEnforced", enforced, "scimEnabled", scim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAuditLogs() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, email, idp_provider, ip_address, status, logged_in_at FROM sso_login_audit ORDER BY logged_in_at DESC LIMIT 50");
    }
}
