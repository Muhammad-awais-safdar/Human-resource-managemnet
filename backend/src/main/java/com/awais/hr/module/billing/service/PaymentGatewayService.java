package com.awais.hr.module.billing.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface PaymentGatewayService {
    
    Map<String, Object> createCheckoutSession(Map<String, Object> request);

    Map<String, Object> handleWebhook(String provider, String rawPayload, String signatureHeader);

    Map<String, Object> issueRefund(String tenantId, String invoiceId, BigDecimal amount, String reason);

    Map<String, Object> issueCreditNote(String tenantId, BigDecimal amount, String reason);

    List<Map<String, Object>> getSubscriptionPlans();

    List<Map<String, Object>> getAllPlansForAdmin();

    Map<String, Object> saveOrUpdatePlan(Map<String, Object> planData);
}
