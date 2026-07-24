package com.awais.hr.module.billing.service;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.billing.service.provider.SubscriptionPaymentProvider;
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
public class PaymentGatewayServiceImpl implements PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(PaymentGatewayServiceImpl.class);
    private final DataSource dataSource;
    private final Map<String, SubscriptionPaymentProvider> providerMap = new HashMap<>();

    public PaymentGatewayServiceImpl(DataSource dataSource, List<SubscriptionPaymentProvider> providers) {
        this.dataSource = dataSource;
        for (SubscriptionPaymentProvider p : providers) {
            providerMap.put(p.getProviderCode().toUpperCase(), p);
        }
    }

    @Override
    public Map<String, Object> createCheckoutSession(Map<String, Object> request) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = (String) request.get("tenantId");
        }
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException("Tenant context identifier is required.");
        }

        String providerCode = request.get("provider") != null ? ((String) request.get("provider")).toUpperCase() : "STRIPE";
        SubscriptionPaymentProvider provider = providerMap.get(providerCode);
        if (provider == null) {
            throw new IllegalArgumentException("Unsupported subscription payment provider: " + providerCode);
        }

        String planCode = (String) request.get("planCode");
        if (planCode == null || planCode.isBlank()) {
            throw new IllegalArgumentException("Subscription planCode parameter is required.");
        }

        String cycle = request.get("billingCycle") != null ? (String) request.get("billingCycle") : "MONTHLY";
        int requestedSeats = request.get("seatCount") != null ? ((Number) request.get("seatCount")).intValue() : 1;
        if (requestedSeats < 1) {
            throw new IllegalArgumentException("Seat count must be at least 1.");
        }

        String successUrl = (String) request.getOrDefault("successUrl", "/settings/billing?status=success");
        String cancelUrl = (String) request.getOrDefault("cancelUrl", "/settings/billing?status=cancelled");

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> planRows = jdbc.queryForList(
                "SELECT base_price_usd, per_seat_price_usd, max_employees FROM subscription_plan WHERE code = ? AND is_active = TRUE",
                planCode.toUpperCase()
        );

        if (planRows.isEmpty()) {
            throw new IllegalArgumentException("Subscription plan '" + planCode + "' is invalid or inactive.");
        }

        Map<String, Object> p = planRows.get(0);
        BigDecimal basePrice = BigDecimal.valueOf(((Number) p.get("base_price_usd")).doubleValue());
        BigDecimal perSeatPrice = BigDecimal.valueOf(((Number) p.get("per_seat_price_usd")).doubleValue());
        int includedSeats = ((Number) p.get("max_employees")).intValue();

        // Add-on Seat Calculation: Charge extra seats beyond included plan capacity dynamically
        int extraSeats = Math.max(0, requestedSeats - includedSeats);
        BigDecimal extraSeatCharge = perSeatPrice.multiply(BigDecimal.valueOf(extraSeats));
        BigDecimal totalMonthlyAmount = basePrice.add(extraSeatCharge);

        BigDecimal finalAmount = totalMonthlyAmount;
        if ("ANNUAL".equalsIgnoreCase(cycle)) {
            finalAmount = totalMonthlyAmount.multiply(BigDecimal.valueOf(12)).multiply(BigDecimal.valueOf(0.85));
        }

        log.info("Subscription Pricing Calculated (Dynamic): Tenant={} Plan={} Base=${} IncludedSeats={} RequestedSeats={} ExtraSeats={} ExtraCharge=${} FinalTotal=${} ({})",
                tenantId, planCode, basePrice, includedSeats, requestedSeats, extraSeats, extraSeatCharge, finalAmount, cycle);

        Map<String, Object> session = provider.createCheckoutSession(tenantId, planCode, cycle, requestedSeats, finalAmount, successUrl, cancelUrl);
        Map<String, Object> result = new HashMap<>(session);
        result.put("includedSeats", includedSeats);
        result.put("extraSeats", extraSeats);
        result.put("extraSeatCharge", extraSeatCharge);
        result.put("basePriceUsd", basePrice);
        result.put("perSeatAddonRate", perSeatPrice);
        return result;
    }

    @Override
    public Map<String, Object> handleWebhook(String providerCode, String rawPayload, String signatureHeader) {
        SubscriptionPaymentProvider provider = providerMap.get(providerCode.toUpperCase());
        if (provider == null) {
            throw new IllegalArgumentException("Unsupported payment provider: " + providerCode);
        }

        if (!provider.verifyWebhookSignature(rawPayload, signatureHeader)) {
            log.warn("Invalid webhook signature received for provider {}", providerCode);
            throw new IllegalArgumentException("Invalid webhook signature");
        }

        return provider.processWebhookEvent(rawPayload);
    }

    @Override
    public Map<String, Object> issueRefund(String tenantId, String invoiceId, BigDecimal amount, String reason) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String refundId = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO billing_refund (id, tenant_id, invoice_id, amount, status) VALUES (?, ?, ?, ?, 'PROCESSED')",
                refundId, tenantId, invoiceId, amount);

        log.info("Issued refund for tenant {} invoice {} amount=${}", tenantId, invoiceId, amount);
        return Map.of("refundId", refundId, "tenantId", tenantId, "invoiceId", invoiceId, "amount", amount, "status", "PROCESSED");
    }

    @Override
    public Map<String, Object> issueCreditNote(String tenantId, BigDecimal amount, String reason) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        String cnNum = "CN-" + (System.currentTimeMillis() / 1000);

        jdbc.update("INSERT INTO billing_credit_note (id, tenant_id, credit_note_number, amount, reason, status) VALUES (?, ?, ?, ?, ?, 'ISSUED')",
                id, tenantId, cnNum, amount, reason != null ? reason : "Account credit adjustment");

        log.info("Issued credit note {} for tenant {} amount=${}", cnNum, tenantId, amount);
        return Map.of("id", id, "creditNoteNumber", cnNum, "tenantId", tenantId, "amount", amount, "status", "ISSUED");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSubscriptionPlans() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, code, name, base_price_usd, per_seat_price_usd, billing_cycle, max_employees, max_storage_gb FROM subscription_plan WHERE is_active = TRUE ORDER BY base_price_usd ASC");
        if (list.isEmpty()) {
            return List.of(
                    Map.of("code", "STARTER", "name", "Starter HR", "basePriceUsd", 49.0, "perSeatPriceUsd", 4.0, "maxEmployees", 15, "maxStorageGb", 25),
                    Map.of("code", "PROFESSIONAL", "name", "Growth Professional", "basePriceUsd", 199.0, "perSeatPriceUsd", 7.0, "maxEmployees", 50, "maxStorageGb", 100),
                    Map.of("code", "ENTERPRISE", "name", "Enterprise Suite", "basePriceUsd", 499.0, "perSeatPriceUsd", 10.0, "maxEmployees", 100, "maxStorageGb", 500)
            );
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPlansForAdmin() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, code, name, base_price_usd, per_seat_price_usd, billing_cycle, max_employees, max_storage_gb, is_active, created_at FROM subscription_plan ORDER BY base_price_usd ASC");
    }

    @Override
    public Map<String, Object> saveOrUpdatePlan(Map<String, Object> planData) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String code = (String) planData.get("code");
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Plan code is required.");
        }
        String name = (String) planData.getOrDefault("name", code);
        BigDecimal basePrice = BigDecimal.valueOf(((Number) planData.getOrDefault("basePriceUsd", 0.00)).doubleValue());
        BigDecimal seatPrice = BigDecimal.valueOf(((Number) planData.getOrDefault("perSeatPriceUsd", 0.00)).doubleValue());
        String cycle = (String) planData.getOrDefault("billingCycle", "MONTHLY");
        int maxEmp = planData.get("maxEmployees") != null ? ((Number) planData.get("maxEmployees")).intValue() : 10;
        int maxStorage = planData.get("maxStorageGb") != null ? ((Number) planData.get("maxStorageGb")).intValue() : 5;
        boolean isActive = planData.get("isActive") != null ? (Boolean) planData.get("isActive") : true;

        List<Map<String, Object>> existing = jdbc.queryForList("SELECT id FROM subscription_plan WHERE code = ?", code.toUpperCase());
        if (existing.isEmpty()) {
            String id = UUID.randomUUID().toString();
            jdbc.update("INSERT INTO subscription_plan (id, code, name, base_price_usd, per_seat_price_usd, billing_cycle, max_employees, max_storage_gb, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    id, code.toUpperCase(), name, basePrice, seatPrice, cycle, maxEmp, maxStorage, isActive);
            log.info("Created new subscription plan {} by Super Admin", code);
        } else {
            jdbc.update("UPDATE subscription_plan SET name = ?, base_price_usd = ?, per_seat_price_usd = ?, billing_cycle = ?, max_employees = ?, max_storage_gb = ?, is_active = ? WHERE code = ?",
                    name, basePrice, seatPrice, cycle, maxEmp, maxStorage, isActive, code.toUpperCase());
            log.info("Updated subscription plan {} by Super Admin", code);
        }

        return Map.of("code", code.toUpperCase(), "name", name, "basePriceUsd", basePrice, "perSeatPriceUsd", seatPrice, "isActive", isActive);
    }
}
