package com.awais.hr.module.expense.service;

import com.awais.hr.module.expense.dto.ExpenseClaimRequestDTO;
import java.util.List;
import java.util.Map;

public interface ExpenseService {
    List<Map<String, Object>> getExpenses(String email);
    void submitExpense(String email, ExpenseClaimRequestDTO dto);
    void deleteExpense(String id);
    void uploadReceipt(String expenseId, String receiptUrl);
    void approveExpense(String expenseId, String email);
    void rejectExpense(String expenseId, String email);
}
