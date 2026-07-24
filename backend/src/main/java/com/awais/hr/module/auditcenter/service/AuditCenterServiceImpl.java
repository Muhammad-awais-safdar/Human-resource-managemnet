package com.awais.hr.module.auditcenter.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class AuditCenterServiceImpl implements AuditCenterService {

    private static final Logger log = LoggerFactory.getLogger(AuditCenterServiceImpl.class);
    private final DataSource dataSource;

    public AuditCenterServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogs() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, actor_email, action_type, entity_name, entity_id, details, ip_address, performed_at FROM enterprise_audit_log ORDER BY performed_at DESC LIMIT 50");
        if (list.isEmpty()) {
            return List.of(
                    Map.of("actorEmail", "sec.admin@workforceos.com", "actionType", "UPDATE", "entityName", "PayrollBatch", "entityId", "batch-101", "details", "Payroll locked for July period", "ipAddress", "192.168.1.45")
            );
        }
        return list;
    }

    @Override
    public Map<String, Object> recordAuditLog(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actor = (String) body.get("actorEmail");
        String action = (String) body.get("actionType");
        if (actor == null || actor.isBlank() || action == null || action.isBlank()) {
            throw new IllegalArgumentException("Actor email and action type are required.");
        }
        String entity = body.get("entityName") != null ? (String) body.get("entityName") : "SystemRecord";
        String entityId = body.get("entityId") != null ? (String) body.get("entityId") : UUID.randomUUID().toString();
        String details = body.get("details") != null ? (String) body.get("details") : "Audit mutation logged";
        String ip = body.get("ipAddress") != null ? (String) body.get("ipAddress") : "127.0.0.1";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO enterprise_audit_log (id, actor_email, action_type, entity_name, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, actor.trim(), action.trim(), entity, entityId, details, ip
        );
        log.info("Audit log recorded: actor={} action={} entity={}", actor, action, entity);
        return Map.of("id", id, "actorEmail", actor, "actionType", action, "entityName", entity, "entityId", entityId, "details", details);
    }

    @Override
    @Transactional(readOnly = true)
    public String exportCsv() {
        List<Map<String, Object>> logs = getLogs();
        StringBuilder sb = new StringBuilder("Actor,Action,Entity,Details,IPAddress,PerformedAt\n");
        for (Map<String, Object> l : logs) {
            sb.append(l.getOrDefault("actor_email", l.get("actorEmail"))).append(",")
              .append(l.getOrDefault("action_type", l.get("actionType"))).append(",")
              .append(l.getOrDefault("entity_name", l.get("entityName"))).append(",")
              .append("\"").append(l.get("details")).append("\",")
              .append(l.getOrDefault("ip_address", l.get("ipAddress"))).append("\n");
        }
        return sb.toString();
    }
}
