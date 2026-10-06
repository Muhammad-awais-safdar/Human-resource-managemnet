package com.awais.hr.module.auditcenter.service;

import com.awais.hr.module.auditcenter.EnterpriseAuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class AuditCenterServiceImpl implements AuditCenterService {

    private static final Logger log = LoggerFactory.getLogger(AuditCenterServiceImpl.class);
    private final EnterpriseAuditService enterpriseAuditService;

    public AuditCenterServiceImpl(EnterpriseAuditService enterpriseAuditService) {
        this.enterpriseAuditService = enterpriseAuditService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogs() {
        return enterpriseAuditService.searchAuditLogs(null, null, null, null, null, null, 100);
    }

    @Override
    public Map<String, Object> recordAuditLog(Map<String, Object> body) {
        String actor = (String) body.get("actorEmail");
        String action = (String) body.get("actionType");
        if (actor == null || actor.isBlank() || action == null || action.isBlank()) {
            throw new IllegalArgumentException("Actor email and action type are required.");
        }
        String entity = body.get("entityName") != null ? (String) body.get("entityName") : "SystemRecord";
        String entityId = body.get("entityId") != null ? (String) body.get("entityId") : UUID.randomUUID().toString();
        String details = body.get("details") != null ? (String) body.get("details") : "Audit mutation logged";
        String ip = body.get("ipAddress") != null ? (String) body.get("ipAddress") : "127.0.0.1";

        enterpriseAuditService.logEvent(
                "DEFAULT_TENANT", actor, action, entity, entityId, null, null, details, ip, "REST_API", UUID.randomUUID().toString()
        );

        return Map.of("actorEmail", actor, "actionType", action, "entityName", entity, "entityId", entityId, "details", details);
    }

    @Override
    @Transactional(readOnly = true)
    public String exportCsv() {
        return enterpriseAuditService.exportAuditLogsCsv(null, null, null);
    }
}
