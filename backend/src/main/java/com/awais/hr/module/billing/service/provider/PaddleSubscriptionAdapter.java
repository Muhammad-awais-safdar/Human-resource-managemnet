package com.awais.hr.module.billing.service.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
public class PaddleSubscriptionAdapter implements SubscriptionPaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(PaddleSubscriptionAdapter.class);

    @Override
    public String getProviderCode() {
        return "PADDLE";
    }

    @Override
    public Map<String, Object> createCheckoutSession(
            String tenantId, String planCode, String billingCycle, int seatCount, BigDecimal amount, String successUrl, String cancelUrl) {
        String txnId = "txn_paddle_" + UUID.randomUUID().toString().substring(0, 12);
        String url = "https://buy.paddle.com/checkout/" + txnId;
        log.info("Created Paddle Checkout Session: id={} tenant={}", txnId, tenantId);
        return Map.of("provider", getProviderCode(), "sessionId", txnId, "checkoutUrl", url, "amountTotal", amount, "currency", "USD");
    }

    @Override
    public boolean verifyWebhookSignature(String rawPayload, String signatureHeader) {
        return signatureHeader != null;
    }

    @Override
    public Map<String, Object> processWebhookEvent(String rawPayload) {
        return Map.of("eventType", "subscription_payment_succeeded", "status", "PAID", "processed", true);
    }

    @Override
    public Map<String, Object> issueRefund(String invoiceId, BigDecimal amount, String reason) {
        return Map.of("refundId", "pad_ref_" + UUID.randomUUID().toString().substring(0, 8), "status", "SUCCEEDED");
    }
}
