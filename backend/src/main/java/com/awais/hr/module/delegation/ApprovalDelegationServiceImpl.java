package com.awais.hr.module.delegation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ApprovalDelegationServiceImpl implements ApprovalDelegationService {

    private static final Logger log = LoggerFactory.getLogger(ApprovalDelegationServiceImpl.class);
    private final DataSource dataSource;

    public ApprovalDelegationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Map<String, Object> createDelegation(String delegatorEmail, String delegateeEmail, String scope, String reason, Date effectiveFrom, Date effectiveUntil) {
        if (delegatorEmail == null || delegateeEmail == null || delegatorEmail.isBlank() || delegateeEmail.isBlank()) {
            throw new IllegalArgumentException("Delegator and Delegatee emails are required.");
        }

        if (delegatorEmail.equalsIgnoreCase(delegateeEmail)) {
            throw new IllegalArgumentException("Self-delegation is prohibited. Delegator cannot delegate to themselves.");
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        String cleanScope = scope != null && !scope.isBlank() ? scope.trim().toUpperCase() : "ALL";
        Date fromDate = effectiveFrom != null ? effectiveFrom : new Date();

        jdbc.update(
                "INSERT INTO approval_delegation (id, delegator_email, delegatee_email, scope, reason, effective_from, effective_until, status) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')",
                id, delegatorEmail.trim(), delegateeEmail.trim(), cleanScope, reason, fromDate, effectiveUntil
        );

        log.info("Approval delegation created: id={} delegator={} delegatee={} scope={}", id, delegatorEmail, delegateeEmail, cleanScope);

        return Map.of(
                "id", id,
                "delegatorEmail", delegatorEmail,
                "delegateeEmail", delegateeEmail,
                "scope", cleanScope,
                "status", "ACTIVE"
        );
    }

    @Override
    public Map<String, Object> revokeDelegation(String delegationId, String actorEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT delegator_email, delegatee_email FROM approval_delegation WHERE id = ? AND status = 'ACTIVE'", delegationId);

        if (list.isEmpty()) {
            throw new IllegalArgumentException("Active delegation not found: " + delegationId);
        }

        String delegator = (String) list.get(0).get("delegator_email");

        // Only delegator or admin can revoke
        if (!actorEmail.equalsIgnoreCase(delegator)) {
            boolean isAdmin = Boolean.TRUE.equals(jdbc.queryForObject(
                    "SELECT EXISTS(SELECT 1 FROM employee e JOIN employee_role er ON e.id = er.employee_id JOIN role r ON er.role_id = r.id WHERE e.email = ? AND r.name IN ('TENANT_ADMIN', 'SYSTEM_ADMIN'))",
                    Boolean.class, actorEmail));
            if (!isAdmin) {
                throw new SecurityException("Only the delegator or administrator can revoke this delegation.");
            }
        }

        jdbc.update("UPDATE approval_delegation SET status = 'REVOKED' WHERE id = ?", delegationId);
        log.info("Approval delegation revoked: id={} by={}", delegationId, actorEmail);

        return Map.of("id", delegationId, "status", "REVOKED", "revokedBy", actorEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveDelegationsForDelegator(String delegatorEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, delegator_email, delegatee_email, scope, reason, effective_from, effective_until, status, created_at " +
                        "FROM approval_delegation WHERE delegator_email = ? AND status = 'ACTIVE' AND (effective_until IS NULL OR effective_until >= CURRENT_TIMESTAMP) ORDER BY created_at DESC",
                delegatorEmail
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveDelegationsForDelegatee(String delegateeEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, delegator_email, delegatee_email, scope, reason, effective_from, effective_until, status, created_at " +
                        "FROM approval_delegation WHERE delegatee_email = ? AND status = 'ACTIVE' AND (effective_until IS NULL OR effective_until >= CURRENT_TIMESTAMP) ORDER BY created_at DESC",
                delegateeEmail
        );
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isDelegatedApprover(String delegateeEmail, String delegatorEmail, String scope) {
        if (delegateeEmail == null || delegatorEmail == null) {
            return false;
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String cleanScope = scope != null ? scope.trim().toUpperCase() : "ALL";

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM approval_delegation " +
                        "WHERE delegatee_email = ? AND delegator_email = ? AND status = 'ACTIVE' " +
                        "AND (scope = 'ALL' OR scope = ?) " +
                        "AND effective_from <= CURRENT_TIMESTAMP " +
                        "AND (effective_until IS NULL OR effective_until >= CURRENT_TIMESTAMP)",
                Integer.class, delegateeEmail, delegatorEmail, cleanScope
        );

        return count != null && count > 0;
    }
}
