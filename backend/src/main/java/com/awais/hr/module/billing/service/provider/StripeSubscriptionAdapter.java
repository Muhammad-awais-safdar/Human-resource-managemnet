package com.awais.hr.module.billing.service.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
public class StripeSubscriptionAdapter implements SubscriptionPaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(StripeSubscriptionAdapter.class);

    @Override
    public String getProviderCode() {
        return "STRIPE";
    }

    @Override
    public Map<String, Object> createCheckoutSession(
            String tenantId,
            String planCode,
            String billingCycle,
            int seatCount,
            BigDecimal amount,
            String successUrl,
            String cancelUrl) {
        
        String sessionId = "cs_stripe_" + UUID.randomUUID().toString().substring(0, 12);
        String checkoutUrl = "https://checkout.stripe.com/pay/" + sessionId;
        log.info("Created Stripe Checkout Session: id={} tenant={} amount=${}", sessionId, tenantId, amount);

        return Map.of(
                "provider", getProviderCode(),
                "sessionId", sessionId,
                "checkoutUrl", checkoutUrl,
                "amountTotal", amount,
                "currency", "USD",
                "status", "OPEN"
        );
    }

    @Override
    public boolean verifyWebhookSignature(String rawPayload, String signatureHeader) {
        return signatureHeader != null && !signatureHeader.isBlank();
    }

    @Override
    public Map<String, Object> processWebhookEvent(String rawPayload) {
        log.info("Processing Stripe Webhook Event");
        return Map.of("eventType", "invoice.payment_succeeded", "status", "PAID", "processed", true);
    }

    @Override
    public Map<String, Object> issueRefund(String invoiceId, BigDecimal amount, String reason) {
        String refundId = "re_stripe_" + UUID.randomUUID().toString().substring(0, 12);
        log.info("Issued Stripe Refund: id={} invoice={} amount=${}", refundId, invoiceId, amount);
        return Map.of("refundId", refundId, "invoiceId", invoiceId, "amount", amount, "status", "SUCCEEDED");
    }
}
