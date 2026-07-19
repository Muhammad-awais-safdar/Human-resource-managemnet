package com.awais.hr.module.expense.service;

import com.awais.hr.module.expense.dto.ExpenseClaimRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final DataSource dataSource;

    public ExpenseServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private boolean isSuperAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        return jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND r.name = 'SUPER_ADMIN')",
                Boolean.class, employeeId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExpenses(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT id, amount, description, status, receipt_url, deleted FROM expense_claim ORDER BY id",
                    new Object[]{}
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT id, amount, description, status, receipt_url FROM expense_claim WHERE employee_id = ? AND deleted = FALSE ORDER BY id",
                    empId
            );
        }
    }

    @Override
    public void submitExpense(String email, ExpenseClaimRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        jdbcTemplate.update("INSERT INTO expense_claim (id, employee_id, amount, description, status, receipt_url) VALUES (?, ?, ?, ?, 'PENDING', ?)",
                UUID.randomUUID().toString(), empId, dto.getAmount(), dto.getDescription(), dto.getReceiptUrl());
    }

    @Override
    public void deleteExpense(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE expense_claim SET deleted = TRUE WHERE id = ?", id);
    }

    @Override
    public void uploadReceipt(String expenseId, String receiptUrl) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE expense_claim SET receipt_url = ? WHERE id = ?", receiptUrl, expenseId);
    }

    @Override
    public void approveExpense(String expenseId, String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        Map<String, Object> claim = jdbcTemplate.queryForMap("SELECT amount, status FROM expense_claim WHERE id = ?", expenseId);
        String status = (String) claim.get("status");
        if (!"PENDING".equalsIgnoreCase(status)) {
            throw new IllegalStateException("Only PENDING claims can be approved.");
        }
        
        java.math.BigDecimal amount = (java.math.BigDecimal) claim.get("amount");
        if (amount.compareTo(new java.math.BigDecimal("500.00")) > 0 && !isSuperAdmin(jdbcTemplate, empId)) {
            throw new SecurityException("Claims exceeding $500.00 require Super Admin approval.");
        }
        
        jdbcTemplate.update("UPDATE expense_claim SET status = 'APPROVED' WHERE id = ?", expenseId);
    }

    @Override
    public void rejectExpense(String expenseId, String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        Map<String, Object> claim = jdbcTemplate.queryForMap("SELECT amount, status FROM expense_claim WHERE id = ?", expenseId);
        String status = (String) claim.get("status");
        if (!"PENDING".equalsIgnoreCase(status)) {
            throw new IllegalStateException("Only PENDING claims can be rejected.");
        }
        
        java.math.BigDecimal amount = (java.math.BigDecimal) claim.get("amount");
        if (amount.compareTo(new java.math.BigDecimal("500.00")) > 0 && !isSuperAdmin(jdbcTemplate, empId)) {
            throw new SecurityException("Claims exceeding $500.00 require Super Admin rejection.");
        }
        
        jdbcTemplate.update("UPDATE expense_claim SET status = 'REJECTED' WHERE id = ?", expenseId);
    }
}
