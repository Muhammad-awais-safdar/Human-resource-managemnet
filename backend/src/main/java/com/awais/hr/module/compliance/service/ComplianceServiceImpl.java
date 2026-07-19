package com.awais.hr.module.compliance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ComplianceServiceImpl implements ComplianceService {

    private static final Logger log = LoggerFactory.getLogger(ComplianceServiceImpl.class);
    private final DataSource dataSource;

    public ComplianceServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void saveGdprConsent(String employeeEmail, boolean consentGiven) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, employeeEmail);

        List<String> consentIds = jdbc.queryForList("SELECT id FROM gdpr_consent WHERE employee_id = ?", String.class, employeeId);
        if (consentIds.isEmpty()) {
            String newId = UUID.randomUUID().toString();
            jdbc.update("INSERT INTO gdpr_consent (id, employee_id, consent_given, updated_at) VALUES (?, ?, ?, NOW())",
                    newId, employeeId, consentGiven);
        } else {
            jdbc.update("UPDATE gdpr_consent SET consent_given = ?, updated_at = NOW() WHERE employee_id = ?",
                    consentGiven, employeeId);
        }
        logAudit("UPDATE_GDPR_CONSENT", "gdpr_consent", employeeId, employeeEmail, "N/A", String.valueOf(consentGiven));
        log.info("GDPR consent saved for employee={}: {}", employeeEmail, consentGiven);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getGdprConsent(String employeeEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, employeeEmail);

        List<Map<String, Object>> consents = jdbc.queryForList(
                "SELECT consent_given, updated_at FROM gdpr_consent WHERE employee_id = ?", employeeId
        );

        if (consents.isEmpty()) {
            return Map.of("consentGiven", false, "updatedAt", "Not Set");
        }
        Map<String, Object> consent = consents.get(0);
        return Map.of(
                "consentGiven", consent.get("consent_given"),
                "updatedAt", String.valueOf(consent.get("updated_at"))
        );
    }

    @Override
    public void logAudit(String action, String tableName, String recordId, String changedByEmail, String oldValue, String newValue) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO compliance_audit_log (id, action, table_name, record_id, changed_by, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, action.trim().toUpperCase(), tableName.trim(), recordId, changedByEmail, oldValue, newValue
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAuditLogs() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, action, table_name, record_id, changed_by, old_value, new_value, created_at " +
                "FROM compliance_audit_log ORDER BY created_at DESC LIMIT 100"
        );
    }

    @Override
    public int runDataRetentionPurge() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        int purgedRows = 0;

        // Purge soft-deleted records from enterprise tables
        purgedRows += jdbc.update("DELETE FROM leave_request WHERE deleted = TRUE");
        purgedRows += jdbc.update("DELETE FROM attendance_record WHERE deleted = TRUE");
        purgedRows += jdbc.update("DELETE FROM candidate_application WHERE deleted = TRUE");
        purgedRows += jdbc.update("DELETE FROM support_ticket WHERE deleted = TRUE");
        purgedRows += jdbc.update("DELETE FROM expense_claim WHERE deleted = TRUE");
        purgedRows += jdbc.update("DELETE FROM resignation WHERE deleted = TRUE");

        // Purge expired document records older than 30 days
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -30);
        java.sql.Date thirtyDaysAgo = new java.sql.Date(cal.getTimeInMillis());
        purgedRows += jdbc.update("DELETE FROM document_record WHERE expiry_date < ?", thirtyDaysAgo);

        log.info("Data retention compliance purge complete. Total rows deleted: {}", purgedRows);
        return purgedRows;
    }
}
