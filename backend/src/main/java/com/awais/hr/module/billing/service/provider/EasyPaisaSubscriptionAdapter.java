package com.awais.hr.module.billing.service.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
public class EasyPaisaSubscriptionAdapter implements SubscriptionPaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(EasyPaisaSubscriptionAdapter.class);

    @Override
    public String getProviderCode() {
        return "EASYPAISA";
    }

    @Override
    public Map<String, Object> createCheckoutSession(
            String tenantId, String planCode, String billingCycle, int seatCount, BigDecimal amount, String successUrl, String cancelUrl) {

        String orderId = "EP-PKR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal amountPkr = amount.multiply(BigDecimal.valueOf(278.00));

        log.info("Generating EasyPaisa Pakistan Checkout Session: OrderId={} Tenant={} AmountPKR={}", orderId, tenantId, amountPkr);

        String checkoutUrl = "https://easypaisa.com.pk/checkout?orderId=" + orderId;
        return Map.of(
                "provider", getProviderCode(),
                "checkoutUrl", checkoutUrl,
                "orderId", orderId,
                "amountPkr", amountPkr,
                "currency", "PKR",
                "status", "PENDING_CHECKOUT"
        );
    }

    @Override
    public boolean verifyWebhookSignature(String rawPayload, String signatureHeader) {
        return signatureHeader != null && !signatureHeader.isBlank();
    }

    @Override
    public Map<String, Object> processWebhookEvent(String rawPayload) {
        log.info("Processing EasyPaisa Pakistan Payment Callback");
        return Map.of("provider", getProviderCode(), "status", "PAID", "reconciled", true);
    }
}
