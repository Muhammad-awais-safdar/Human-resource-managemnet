package com.awais.hr.module.bankpayroll.service.provider;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface PayrollDisbursementProvider {

    String getProviderCode();

    Map<String, Object> executeDisbursementBatch(
            String batchId,
            String tenantId,
            String idempotencyKey,
            BigDecimal totalAmount,
            String currency,
            List<Map<String, Object>> items,
            Map<String, Object> tenantCredentials
    );

    Map<String, Object> checkBatchStatus(String providerBatchRef);
}
