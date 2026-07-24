package com.awais.hr.module.billing.service.provider;

import java.math.BigDecimal;
import java.util.Map;

public interface SubscriptionPaymentProvider {
    
    String getProviderCode();

    Map<String, Object> createCheckoutSession(
            String tenantId,
            String planCode,
            String billingCycle,
            int seatCount,
            BigDecimal amount,
            String successUrl,
            String cancelUrl
    );

    boolean verifyWebhookSignature(String rawPayload, String signatureHeader);

    Map<String, Object> processWebhookEvent(String rawPayload);

    default Map<String, Object> issueRefund(String invoiceId, BigDecimal amount, String reason) {
        return Map.of("invoiceId", invoiceId, "amount", amount, "status", "REFUND_REQUESTED");
    }
}
