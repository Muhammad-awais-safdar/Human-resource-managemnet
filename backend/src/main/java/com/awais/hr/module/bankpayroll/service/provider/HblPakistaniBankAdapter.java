package com.awais.hr.module.bankpayroll.service.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class HblPakistaniBankAdapter implements PayrollDisbursementProvider {

    private static final Logger log = LoggerFactory.getLogger(HblPakistaniBankAdapter.class);

    @Override
    public String getProviderCode() {
        return "HBL_DIRECT_PAKISTAN";
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

        String hblBatchRef = "HBL-PAYROLL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal totalPkr = "PKR".equalsIgnoreCase(currency)
                ? totalAmount
                : totalAmount.multiply(BigDecimal.valueOf(278.00));

        log.info("Executing HBL Corporate Direct Salary Batch Disbursement: Ref={} Tenant={} TotalPKR={}",
                hblBatchRef, tenantId, totalPkr);

        return Map.of(
                "providerCode", getProviderCode(),
                "providerBatchRef", hblBatchRef,
                "status", "PROCESSING_HBL_CLEARING",
                "idempotencyKey", idempotencyKey,
                "totalDisbursedPkr", totalPkr
        );
    }

    @Override
    public Map<String, Object> checkBatchStatus(String providerBatchRef) {
        return Map.of("providerBatchRef", providerBatchRef, "status", "DISBURSED", "clearingHouse", "1LINK");
    }
}
