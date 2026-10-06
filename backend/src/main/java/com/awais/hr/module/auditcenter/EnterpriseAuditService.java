package com.awais.hr.module.auditcenter;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface EnterpriseAuditService {

    /**
     * Log a non-sensitive enterprise compliance audit event.
     */
    void logEvent(String tenantId, String actorEmail, String actionType, String entityName,
                  String entityId, String oldValue, String newValue, String details,
                  String ipAddress, String userAgent, String correlationId);

    /**
     * Search compliance audit records by criteria.
     */
    List<Map<String, Object>> searchAuditLogs(String tenantId, String actorEmail, String actionType,
                                              String entityName, Date fromDate, Date toDate, int limit);

    /**
     * Export compliance audit logs in CSV format.
     */
    String exportAuditLogsCsv(String tenantId, String actorEmail, String actionType);
}
