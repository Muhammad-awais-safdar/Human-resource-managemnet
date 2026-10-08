package com.awais.hr.module.makerchecker;

import com.awais.hr.config.AuthorizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class MakerCheckerServiceImpl implements MakerCheckerService {

    private static final Logger log = LoggerFactory.getLogger(MakerCheckerServiceImpl.class);

    private final DataSource dataSource;
    private final AuthorizationService authorizationService;

    public MakerCheckerServiceImpl(DataSource dataSource, AuthorizationService authorizationService) {
        this.dataSource = dataSource;
        this.authorizationService = authorizationService;
    }

    private String getEmployeeIdByEmail(JdbcTemplate jdbc, String email) {
        List<String> list = jdbc.queryForList("SELECT id FROM employee WHERE email = ?", String.class, email);
        if (list.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + email);
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> createRequest(String requestType, String entityId, String changePayload, String makerEmail) {
        if (requestType == null || entityId == null || changePayload == null || makerEmail == null) {
            throw new IllegalArgumentException("Request type, entityId, changePayload, and makerEmail are required.");
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String makerEmpId = getEmployeeIdByEmail(jdbc, makerEmail);

        String id = UUID.randomUUID().toString();
        String cleanType = requestType.trim().toUpperCase();

        jdbc.update("INSERT INTO maker_checker_request (id, request_type, maker_employee_id, entity_id, change_payload, status) VALUES (?, ?, ?, ?, ?, 'PENDING_CHECKER_APPROVAL')",
                id, cleanType, makerEmpId, entityId, changePayload);

        log.info("Maker-Checker request created: id={} type={} entity={} maker={}", id, cleanType, entityId, makerEmail);

        return Map.of(
                "id", id,
                "requestType", cleanType,
                "entityId", entityId,
                "status", "PENDING_CHECKER_APPROVAL",
                "makerEmail", makerEmail
        );
    }

    @Override
    public Map<String, Object> submitRequest(String requestType, String entityType, String entityId, Object payload, String makerEmail) {
        String payloadStr = payload != null ? payload.toString() : "{}";
        return createRequest(requestType, entityId, payloadStr, makerEmail);
    }

    @Override
    public Map<String, Object> approveRequest(String requestId, String checkerEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String checkerEmpId = getEmployeeIdByEmail(jdbc, checkerEmail);

        Map<String, Object> req = getRequestById(requestId);
        String status = (String) req.get("status");
        if (!"PENDING_CHECKER_APPROVAL".equals(status)) {
            throw new IllegalStateException("Maker-Checker request is not pending approval. Current status: " + status);
        }

        String makerEmpId = (String) req.get("maker_employee_id");

        // Enforce Strict Two-Person Integrity: Maker != Checker
        if (makerEmpId.equalsIgnoreCase(checkerEmpId)) {
            String errorMsg = "Maker-Checker Violation: User " + checkerEmail + " cannot act as Checker for their own request.";
            log.warn("[MAKER-CHECKER REJECTION] {}", errorMsg);
            throw new SecurityException(errorMsg);
        }

        // Validate Checker permissions based on request type
        String requestType = (String) req.get("request_type");
        validateCheckerPermission(checkerEmail, requestType);

        // Atomic Idempotent State Transition
        int updated = jdbc.update("UPDATE maker_checker_request SET checker_employee_id = ?, status = 'APPROVED', actioned_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'PENDING_CHECKER_APPROVAL'",
                checkerEmpId, requestId);

        if (updated == 0) {
            throw new IllegalStateException("Request has already been actioned or concurrent update detected.");
        }

        log.info("Maker-Checker request APPROVED: id={} type={} checker={}", requestId, requestType, checkerEmail);

        return Map.of(
                "id", requestId,
                "status", "APPROVED",
                "checkerEmail", checkerEmail,
                "actionedAt", new Date()
        );
    }

    @Override
    public Map<String, Object> rejectRequest(String requestId, String checkerEmail, String reason) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String checkerEmpId = getEmployeeIdByEmail(jdbc, checkerEmail);

        Map<String, Object> req = getRequestById(requestId);
        String status = (String) req.get("status");
        if (!"PENDING_CHECKER_APPROVAL".equals(status)) {
            throw new IllegalStateException("Maker-Checker request is not pending approval.");
        }

        String makerEmpId = (String) req.get("maker_employee_id");
        if (makerEmpId.equalsIgnoreCase(checkerEmpId)) {
            throw new SecurityException("Maker-Checker Violation: User cannot reject their own maker request.");
        }

        int updated = jdbc.update("UPDATE maker_checker_request SET checker_employee_id = ?, status = 'REJECTED', rejection_reason = ?, actioned_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'PENDING_CHECKER_APPROVAL'",
                checkerEmpId, reason, requestId);

        if (updated == 0) {
            throw new IllegalStateException("Request has already been actioned.");
        }

        log.info("Maker-Checker request REJECTED: id={} checker={} reason={}", requestId, checkerEmail, reason);

        return Map.of(
                "id", requestId,
                "status", "REJECTED",
                "checkerEmail", checkerEmail,
                "reason", reason != null ? reason : "Rejected"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingRequests(String checkerEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String checkerEmpId = getEmployeeIdByEmail(jdbc, checkerEmail);

        // Fetch requests pending approval where checker != maker
        return jdbc.queryForList(
                "SELECT m.id, m.request_type, m.entity_id, m.change_payload, m.status, m.requested_at, " +
                        "e.email as maker_email, e.first_name as maker_first_name, e.last_name as maker_last_name " +
                        "FROM maker_checker_request m " +
                        "JOIN employee e ON m.maker_employee_id = e.id " +
                        "WHERE m.status = 'PENDING_CHECKER_APPROVAL' AND m.maker_employee_id <> ? ORDER BY m.requested_at DESC",
                checkerEmpId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMySubmittedRequests(String makerEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String makerEmpId = getEmployeeIdByEmail(jdbc, makerEmail);

        return jdbc.queryForList(
                "SELECT m.id, m.request_type, m.entity_id, m.change_payload, m.status, m.requested_at, m.actioned_at, m.rejection_reason " +
                        "FROM maker_checker_request m " +
                        "WHERE m.maker_employee_id = ? ORDER BY m.requested_at DESC",
                makerEmpId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getRequestById(String requestId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT * FROM maker_checker_request WHERE id = ?", requestId);
        if (list.isEmpty()) {
            throw new IllegalArgumentException("Maker-Checker request not found: " + requestId);
        }
        return list.get(0);
    }

    private void validateCheckerPermission(String checkerEmail, String requestType) {
        switch (requestType.toUpperCase()) {
            case "SALARY_REVISION":
                if (!authorizationService.hasAnyPermission(checkerEmail, "payroll:salary:process", "salary:write", "payroll:salary:approve")) {
                    authorizationService.checkPermission(checkerEmail, "payroll:salary:process");
                }
                break;
            case "BANK_DISBURSEMENT":
                authorizationService.checkPermission(checkerEmail, "payroll:salary:approve");
                break;
            case "ROLE_PROMOTION":
                if (!authorizationService.hasAnyPermission(checkerEmail, "role:manage", "corehr:employee:write")) {
                    authorizationService.checkPermission(checkerEmail, "role:manage");
                }
                break;
            default:
                if (!authorizationService.hasRole(checkerEmail, "TENANT_ADMIN") && !authorizationService.hasRole(checkerEmail, "SYSTEM_ADMIN")) {
                    authorizationService.checkRole(checkerEmail, "TENANT_ADMIN");
                }
        }
    }
}
