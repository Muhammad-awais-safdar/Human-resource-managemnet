package com.awais.hr.module.approvals.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class UnifiedApprovalServiceImpl implements UnifiedApprovalService {

    private static final Logger log = LoggerFactory.getLogger(UnifiedApprovalServiceImpl.class);
    private final DataSource dataSource;

    public UnifiedApprovalServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPendingCounts() {
        return Map.of("leaveCount", 3, "expenseCount", 2, "travelCount", 1, "timesheetCount", 4, "totalPending", 10);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDelegations() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, delegator_email, delegatee_email, reason, status, created_at FROM approval_delegation ORDER BY created_at DESC");
    }

    @Override
    public Map<String, Object> delegateApproval(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String delegator = (String) body.get("delegatorEmail");
        String delegatee = (String) body.get("delegateeEmail");
        if (delegator == null || delegator.isBlank() || delegatee == null || delegatee.isBlank()) {
            throw new IllegalArgumentException("Delegator and Delegatee emails are required.");
        }
        String reason = body.get("reason") != null ? (String) body.get("reason") : "Annual Leave Delegation";

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO approval_delegation (id, delegator_email, delegatee_email, reason, status) VALUES (?, ?, ?, ?, 'ACTIVE')", id, delegator.trim(), delegatee.trim(), reason);
        log.info("Approval delegated: from={} to={}", delegator, delegatee);
        return Map.of("id", id, "delegatorEmail", delegator, "delegateeEmail", delegatee, "reason", reason, "status", "ACTIVE");
    }
}
