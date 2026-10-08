package com.awais.hr.module.expense.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.expense.dto.ExpenseClaimRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private static final Logger log = LoggerFactory.getLogger(ExpenseServiceImpl.class);

    private static final BigDecimal TIER_1_MAX = new BigDecimal("500.00");
    private static final BigDecimal TIER_2_MAX = new BigDecimal("2500.00");

    private final DataSource dataSource;

    public ExpenseServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private boolean isSuperAdminOrFinance(JdbcTemplate jdbcTemplate, String employeeId) {
        Boolean result = jdbcTemplate.queryForObject(
                "SELECT EXISTS(" +
                        "  SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id " +
                        "  WHERE er.employee_id = ? AND r.name IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'SYSTEM_ADMIN', 'FINANCE_ADMIN', 'CFO') " +
                        ")",
                Boolean.class, employeeId
        );
        return Boolean.TRUE.equals(result);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExpenses(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);

        if (isSuperAdminOrFinance(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT c.id, c.amount, c.description, c.status, c.receipt_url, c.tier_level, c.approved_by, c.deleted, " +
                            "e.first_name, e.last_name, e.email " +
                            "FROM expense_claim c JOIN employee e ON c.employee_id = e.id WHERE c.deleted = FALSE ORDER BY c.id DESC"
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT c.id, c.amount, c.description, c.status, c.receipt_url, c.tier_level, c.approved_by " +
                            "FROM expense_claim c WHERE c.employee_id = ? AND c.deleted = FALSE ORDER BY c.id DESC",
                    empId
            );
        }
    }

    @Override
    @Auditable(action = "EXPENSE_SUBMIT", entity = "ExpenseClaim")
    public void submitExpense(String email, ExpenseClaimRequestDTO dto) {
        BigDecimal amount = (dto != null && dto.getAmount() != null) ? dto.getAmount() : BigDecimal.ZERO;
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Expense amount must be greater than zero.");
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);

        int tierLevel = 1;
        if (amount.compareTo(TIER_2_MAX) > 0) {
            tierLevel = 3;
        } else if (amount.compareTo(TIER_1_MAX) > 0) {
            tierLevel = 2;
        }

        String claimId = UUID.randomUUID().toString();
        String initialStatus = "PENDING_TIER_1";

        jdbcTemplate.update(
                "INSERT INTO expense_claim (id, employee_id, amount, description, status, receipt_url, tier_level) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?)",
                claimId, empId, amount, dto.getDescription(), initialStatus, dto.getReceiptUrl(), tierLevel
        );

        jdbcTemplate.update(
                "INSERT INTO expense_approval_log (id, expense_claim_id, tier, action, actor_email, comment) " +
                        "VALUES (?, ?, 1, 'SUBMITTED', ?, 'Expense claim submitted')",
                UUID.randomUUID().toString(), claimId, email
        );

        log.info("Expense claim submitted: claimId={} email={} amount={} tier={}", claimId, email, amount, tierLevel);
    }

    @Override
    public void deleteExpense(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        Map<String, Object> claim = jdbcTemplate.queryForMap("SELECT status FROM expense_claim WHERE id = ?", id);
        String status = (String) claim.get("status");

        if ("APPROVED".equals(status) || "DISBURSED".equals(status)) {
            throw new IllegalStateException("Approved or disbursed expense claims cannot be deleted.");
        }

        jdbcTemplate.update("UPDATE expense_claim SET deleted = TRUE WHERE id = ?", id);
    }

    @Override
    public void uploadReceipt(String expenseId, String receiptUrl) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE expense_claim SET receipt_url = ? WHERE id = ?", receiptUrl, expenseId);
    }

    @Override
    @Auditable(action = "EXPENSE_APPROVE", entity = "ExpenseClaim")
    public void approveExpense(String expenseId, String approverEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        Map<String, Object> claim = jdbcTemplate.queryForMap(
                "SELECT c.employee_id, c.amount, c.status, c.tier_level, e.email as applicant_email " +
                        "FROM expense_claim c JOIN employee e ON c.employee_id = e.id WHERE c.id = ?",
                expenseId
        );

        String applicantEmail = (String) claim.get("applicant_email");
        String currentStatus = (String) claim.get("status");
        BigDecimal amount = (BigDecimal) claim.get("amount");
        int targetTier = (Integer) claim.get("tier_level");

        // 1. Self-Approval Protection
        if (applicantEmail.equalsIgnoreCase(approverEmail)) {
            throw new IllegalArgumentException("Self-Approval Guard: You cannot approve your own expense claim.");
        }

        if ("APPROVED".equals(currentStatus) || "DISBURSED".equals(currentStatus) || "REJECTED".equals(currentStatus)) {
            throw new IllegalStateException("Expense claim " + expenseId + " is already in final state: " + currentStatus);
        }

        String nextStatus;
        int currentApprovalTier;

        if ("PENDING_TIER_1".equals(currentStatus) && targetTier > 1) {
            nextStatus = targetTier == 3 ? "PENDING_TIER_2" : "PENDING_TIER_2";
            currentApprovalTier = 1;
        } else if ("PENDING_TIER_2".equals(currentStatus) && targetTier == 3) {
            nextStatus = "PENDING_CFO";
            currentApprovalTier = 2;
        } else {
            nextStatus = "APPROVED";
            currentApprovalTier = targetTier;
        }

        jdbcTemplate.update(
                "UPDATE expense_claim SET status = ?, approved_by = ? WHERE id = ?",
                nextStatus, approverEmail, expenseId
        );

        jdbcTemplate.update(
                "INSERT INTO expense_approval_log (id, expense_claim_id, tier, action, actor_email, comment) " +
                        "VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), expenseId, currentApprovalTier, nextStatus, approverEmail, "Approved at tier " + currentApprovalTier
        );

        log.info("Expense claim approved: claimId={} approver={} status={} nextStatus={}", expenseId, approverEmail, currentStatus, nextStatus);
    }

    @Override
    @Auditable(action = "EXPENSE_REJECT", entity = "ExpenseClaim")
    public void rejectExpense(String expenseId, String approverEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        Map<String, Object> claim = jdbcTemplate.queryForMap(
                "SELECT c.employee_id, c.status, e.email as applicant_email " +
                        "FROM expense_claim c JOIN employee e ON c.employee_id = e.id WHERE c.id = ?",
                expenseId
        );

        String applicantEmail = (String) claim.get("applicant_email");
        String currentStatus = (String) claim.get("status");

        if (applicantEmail.equalsIgnoreCase(approverEmail)) {
            throw new IllegalArgumentException("Self-Approval Guard: You cannot reject your own expense claim.");
        }

        if ("APPROVED".equals(currentStatus) || "DISBURSED".equals(currentStatus)) {
            throw new IllegalStateException("Approved or disbursed expense claims cannot be rejected.");
        }

        jdbcTemplate.update("UPDATE expense_claim SET status = 'REJECTED', approved_by = ? WHERE id = ?", approverEmail, expenseId);

        jdbcTemplate.update(
                "INSERT INTO expense_approval_log (id, expense_claim_id, tier, action, actor_email, comment) " +
                        "VALUES (?, ?, 1, 'REJECTED', ?, 'Claim rejected')",
                UUID.randomUUID().toString(), expenseId, approverEmail
        );

        log.info("Expense claim rejected: claimId={} by={}", expenseId, approverEmail);
    }

    @Override
    @Auditable(action = "EXPENSE_DISBURSE", entity = "ExpenseClaim")
    public void disburseExpense(String expenseId, String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        Map<String, Object> claim = jdbcTemplate.queryForMap("SELECT status FROM expense_claim WHERE id = ?", expenseId);
        String status = (String) claim.get("status");

        if (!"APPROVED".equals(status)) {
            throw new IllegalStateException("Only APPROVED expense claims can be disbursed.");
        }

        jdbcTemplate.update("UPDATE expense_claim SET status = 'DISBURSED' WHERE id = ?", expenseId);

        jdbcTemplate.update(
                "INSERT INTO expense_approval_log (id, expense_claim_id, tier, action, actor_email, comment) " +
                        "VALUES (?, ?, 3, 'DISBURSED', ?, 'Expense claim disbursed to employee')",
                UUID.randomUUID().toString(), expenseId, email
        );

        log.info("Expense claim disbursed: claimId={} by={}", expenseId, email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExpenseLogs(String expenseId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, tier, action, actor_email, comment, created_at " +
                        "FROM expense_approval_log WHERE expense_claim_id = ? ORDER BY created_at ASC",
                expenseId
        );
    }
}
