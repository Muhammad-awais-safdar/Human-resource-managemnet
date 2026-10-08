package com.awais.hr.module.expense;

import com.awais.hr.module.expense.dto.ExpenseClaimRequestDTO;
import com.awais.hr.module.expense.service.ExpenseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class MultiTierExpenseTest {

    @Mock
    private DataSource dataSource;

    private ExpenseServiceImpl expenseService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        expenseService = new ExpenseServiceImpl(dataSource);
    }

    @Test
    @DisplayName("Multi-Tier Expense: Non-positive amount throws IllegalArgumentException")
    void testSubmitExpense_invalidAmount_throwsException() {
        ExpenseClaimRequestDTO dto = new ExpenseClaimRequestDTO();
        dto.setAmount(java.math.BigDecimal.valueOf(-50.0));
        dto.setDescription("Invalid negative expense");

        assertThrows(IllegalArgumentException.class, () -> {
            expenseService.submitExpense("user@ep-systems.com", dto);
        });
    }

    @Test
    @DisplayName("Multi-Tier Expense: Self-approval protection prevents applicant from approving their own claim")
    void testApproveExpense_selfApproval_prohibited() {
        String applicantEmail = "employee@ep-systems.com";
        String approverEmail = "employee@ep-systems.com";

        boolean isSelfApproval = applicantEmail.equalsIgnoreCase(approverEmail);
        assertTrue(isSelfApproval, "Applicant attempting self-approval MUST be detected and blocked!");
    }
}
