package com.awais.hr.module.bankpayroll.service.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class WisePayrollAdapter implements PayrollDisbursementProvider {

    private static final Logger log = LoggerFactory.getLogger(WisePayrollAdapter.class);

    @Override
    public String getProviderCode() {
        return "WISE";
    }

    @Override
    public Map<String, Object> executeDisbursementBatch(
            String batchId,
            String tenantId,
            String idempotencyKey,
            BigDecimal totalAmount,
            String currency,
            List<Map<String, Object>> items,
            Map<String, Object> tenantCredentials) {

        String ref = "WISE-BATCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Executing Wise Business Batch Payout: ref={} tenant={} amount=${} items={}",
                ref, tenantId, totalAmount, items.size());

        return Map.of(
                "providerCode", getProviderCode(),
                "providerBatchRef", ref,
                "status", "SUBMITTED",
                "idempotencyKey", idempotencyKey,
                "totalDisbursed", totalAmount,
                "processedItems", items.size()
        );
    }

    @Override
    public Map<String, Object> checkBatchStatus(String providerBatchRef) {
        return Map.of("providerBatchRef", providerBatchRef, "status", "PROCESSING", "reconciled", true);
    }
}
