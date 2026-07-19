package com.awais.hr.module.expense.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExpenseClaimRequestDTO {
    private BigDecimal amount;
    private String description;
    private String receiptUrl;
}
