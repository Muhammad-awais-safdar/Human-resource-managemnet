package com.awais.hr.module.bankpayroll.service;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.bankpayroll.service.provider.PayrollDisbursementProvider;
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
public class PayrollDisbursementGatewayServiceImpl implements PayrollDisbursementGatewayService {

    private static final Logger log = LoggerFactory.getLogger(PayrollDisbursementGatewayServiceImpl.class);
    private final DataSource dataSource;
    private final Map<String, PayrollDisbursementProvider> providerMap = new HashMap<>();

    public PayrollDisbursementGatewayServiceImpl(DataSource dataSource, List<PayrollDisbursementProvider> providers) {
        this.dataSource = dataSource;
        for (PayrollDisbursementProvider p : providers) {
            providerMap.put(p.getProviderCode().toUpperCase(), p);
        }
    }

    @Override
    public Map<String, Object> configureProvider(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String providerCode = (String) body.get("providerCode");
        if (providerCode == null || providerCode.isBlank()) {
            throw new IllegalArgumentException("Provider code is required.");
        }
        String env = body.get("environment") != null ? (String) body.get("environment") : "PRODUCTION";
        String apiKey = (String) body.get("apiKey");
        String secretKey = (String) body.get("secretKey");

        jdbc.update("DELETE FROM tenant_payment_credential WHERE provider_code = ?", providerCode.toUpperCase());
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO tenant_payment_credential (id, provider_code, environment, encrypted_api_key, encrypted_secret_key) VALUES (?, ?, ?, ?, ?)",
                id, providerCode.toUpperCase(), env, apiKey, secretKey
        );

        log.info("Configured tenant payroll disbursement provider {} in env {}", providerCode, env);
        return Map.of("id", id, "providerCode", providerCode, "environment", env, "status", "ACTIVE");
    }

    @Override
    public Map<String, Object> executeDisbursement(String batchId, Map<String, Object> body, String idempotencyKeyHeader) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException("Tenant context is missing for disbursement execution.");
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String mfaCode = (String) body.get("mfaVerificationCode");
        if (mfaCode == null || mfaCode.isBlank()) {
            throw new IllegalArgumentException("Multi-Factor Authentication (MFA) verification code is required for salary disbursement.");
        }

        String idempotencyKey = (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank())
                ? idempotencyKeyHeader
                : "idemp-" + batchId + "-" + System.currentTimeMillis();

        List<Map<String, Object>> batches = jdbc.queryForList(
                "SELECT id, batch_name, total_amount, provider_code, currency, status FROM bank_payroll_batch WHERE id = ?",
                batchId
        );

        if (batches.isEmpty()) {
            throw new IllegalArgumentException("Payroll batch not found for ID: " + batchId);
        }

        Map<String, Object> b = batches.get(0);
        String providerCode = (String) b.getOrDefault("provider_code", "WISE");
        BigDecimal amount = BigDecimal.valueOf(((Number) b.getOrDefault("total_amount", 0.00)).doubleValue());
        String currency = (String) b.getOrDefault("currency", "USD");
        String batchName = (String) b.getOrDefault("batch_name", "Salary Batch " + batchId);

        PayrollDisbursementProvider provider = providerMap.get(providerCode.toUpperCase());
        if (provider == null) {
            throw new IllegalArgumentException("Unsupported payroll disbursement provider: " + providerCode);
        }

        // Fetch actual batch line items dynamically from DB
        List<Map<String, Object>> items = jdbc.queryForList(
                "SELECT id, employee_id, employee_name, net_salary, bank_account_number, status FROM payroll_disbursement_item WHERE batch_id = ?",
                batchId
        );

        // Fetch tenant encrypted credentials
        List<Map<String, Object>> credRows = jdbc.queryForList(
                "SELECT encrypted_api_key, encrypted_secret_key, environment FROM tenant_payment_credential WHERE provider_code = ?",
                providerCode.toUpperCase()
        );
        Map<String, Object> tenantCreds = credRows.isEmpty() ? Map.of() : credRows.get(0);

        Map<String, Object> result = provider.executeDisbursementBatch(batchId, tenantId, idempotencyKey, amount, currency, items, tenantCreds);

        String providerRef = (String) result.get("providerBatchRef");
        jdbc.update("UPDATE bank_payroll_batch SET status = 'SUBMITTED', provider_batch_ref = ?, idempotency_key = ? WHERE id = ?",
                providerRef, idempotencyKey, batchId);

        // Transaction log entry
        String logId = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO payroll_transaction_log (id, batch_id, event_type, payload) VALUES (?, ?, 'SUBMITTED_TO_PROVIDER', ?)",
                logId, batchId, result.toString());

        log.info("Executed disbursement for batch {} ref={} tenant={}", batchId, providerRef, tenantId);
        return Map.of(
                "batchId", batchId,
                "batchName", batchName,
                "providerCode", providerCode,
                "providerBatchRef", providerRef,
                "totalAmount", amount,
                "currency", currency,
                "status", "SUBMITTED",
                "idempotencyKey", idempotencyKey
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getBatchStatus(String batchId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, batch_name, total_amount, currency, status, provider_batch_ref, idempotency_key, created_at FROM bank_payroll_batch WHERE id = ?", batchId);
        if (list.isEmpty()) {
            throw new IllegalArgumentException("Payroll batch not found for ID: " + batchId);
        }
        return list.get(0);
    }
}
