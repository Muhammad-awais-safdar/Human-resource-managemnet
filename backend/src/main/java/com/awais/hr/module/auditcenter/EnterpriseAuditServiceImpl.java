package com.awais.hr.module.auditcenter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class EnterpriseAuditServiceImpl implements EnterpriseAuditService {

    private static final Logger log = LoggerFactory.getLogger(EnterpriseAuditServiceImpl.class);
    private final DataSource dataSource;

    public EnterpriseAuditServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void logEvent(String tenantId, String actorEmail, String actionType, String entityName,
                         String entityId, String oldValue, String newValue, String details,
                         String ipAddress, String userAgent, String correlationId) {

        if (actorEmail == null || actorEmail.isBlank() || actionType == null || actionType.isBlank()) {
            log.warn("Skipping invalid audit log entry: missing actor or actionType.");
            return;
        }

        String safeOld = AuditSanitizer.sanitize(oldValue);
        String safeNew = AuditSanitizer.sanitize(newValue);
        String safeDetails = AuditSanitizer.sanitize(details);

        String id = UUID.randomUUID().toString();
        String safeEntity = entityName != null ? entityName : "SystemEntity";
        String safeEntityId = entityId != null ? entityId : "N/A";
        String safeIp = ipAddress != null ? ipAddress : "127.0.0.1";
        String safeCorrelation = correlationId != null ? correlationId : UUID.randomUUID().toString();

        try {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            jdbc.update(
                    "INSERT INTO enterprise_audit_log (id, tenant_id, actor_email, action_type, entity_name, entity_id, " +
                            "old_value, new_value, details, ip_address, user_agent, correlation_id) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    id, tenantId, actorEmail.trim(), actionType.trim().toUpperCase(), safeEntity, safeEntityId,
                    safeOld, safeNew, safeDetails, safeIp, userAgent, safeCorrelation
            );
            log.info("Enterprise audit log recorded: id={} actor={} action={} entity={}:{}", id, actorEmail, actionType, safeEntity, safeEntityId);
        } catch (Exception e) {
            log.error("Failed to insert enterprise audit record: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchAuditLogs(String tenantId, String actorEmail, String actionType,
                                                     String entityName, Date fromDate, Date toDate, int limit) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        StringBuilder sql = new StringBuilder(
                "SELECT id, tenant_id, actor_email, action_type, entity_name, entity_id, old_value, new_value, details, " +
                        "ip_address, user_agent, correlation_id, performed_at FROM enterprise_audit_log WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (tenantId != null && !tenantId.isBlank()) {
            sql.append("AND tenant_id = ? ");
            params.add(tenantId);
        }
        if (actorEmail != null && !actorEmail.isBlank()) {
            sql.append("AND actor_email = ? ");
            params.add(actorEmail);
        }
        if (actionType != null && !actionType.isBlank()) {
            sql.append("AND action_type = ? ");
            params.add(actionType.toUpperCase());
        }
        if (entityName != null && !entityName.isBlank()) {
            sql.append("AND entity_name = ? ");
            params.add(entityName);
        }

        sql.append("ORDER BY performed_at DESC LIMIT ?");
        params.add(limit > 0 ? limit : 100);

        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    @Override
    @Transactional(readOnly = true)
    public String exportAuditLogsCsv(String tenantId, String actorEmail, String actionType) {
        List<Map<String, Object>> logs = searchAuditLogs(tenantId, actorEmail, actionType, null, null, null, 1000);

        StringBuilder sb = new StringBuilder();
        sb.append("ID,Tenant ID,Actor Email,Action Type,Entity Name,Entity ID,IP Address,Performed At\n");

        for (Map<String, Object> row : logs) {
            sb.append(row.getOrDefault("id", "")).append(",")
              .append(row.getOrDefault("tenant_id", "N/A")).append(",")
              .append(row.getOrDefault("actor_email", "")).append(",")
              .append(row.getOrDefault("action_type", "")).append(",")
              .append(row.getOrDefault("entity_name", "")).append(",")
              .append(row.getOrDefault("entity_id", "")).append(",")
              .append(row.getOrDefault("ip_address", "127.0.0.1")).append(",")
              .append(row.getOrDefault("performed_at", "")).append("\n");
        }

        return sb.toString();
    }
}
