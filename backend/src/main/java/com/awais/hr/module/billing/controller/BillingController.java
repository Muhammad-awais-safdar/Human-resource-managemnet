package com.awais.hr.module.billing.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.billing.service.PaymentGatewayService;
import com.awais.hr.module.billing.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/billing")
public class BillingController {

    private final SubscriptionService subscriptionService;
    private final PaymentGatewayService paymentGatewayService;

    public BillingController(SubscriptionService subscriptionService, PaymentGatewayService paymentGatewayService) {
        this.subscriptionService = subscriptionService;
        this.paymentGatewayService = paymentGatewayService;
    }

    @GetMapping("/subscription")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getSubscription() {
        return ResponseEntity.ok(subscriptionService.getSubscription());
    }

    @PostMapping("/subscription")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updatePlan(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(subscriptionService.updatePlan(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/invoices")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getInvoices() {
        return ResponseEntity.ok(subscriptionService.getInvoices());
    }

    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getSubscriptionPlans() {
        return ResponseEntity.ok(paymentGatewayService.getSubscriptionPlans());
    }

    @PostMapping("/checkout")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(paymentGatewayService.createCheckoutSession(body));
    }

    @PostMapping("/webhooks/{provider}")
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @PathVariable String provider,
            @RequestBody String payload,
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature) {
        try {
            return ResponseEntity.ok(paymentGatewayService.handleWebhook(provider, payload, signature));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/credit-notes")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<Map<String, Object>> issueCreditNote(@RequestBody Map<String, Object> body) {
        String tenantId = (String) body.getOrDefault("tenantId", "awais");
        BigDecimal amount = BigDecimal.valueOf(((Number) body.getOrDefault("amount", 50.0)).doubleValue());
        String reason = (String) body.get("reason");
        return ResponseEntity.ok(paymentGatewayService.issueCreditNote(tenantId, amount, reason));
    }
}
