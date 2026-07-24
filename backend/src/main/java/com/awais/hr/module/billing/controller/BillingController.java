package com.awais.hr.module.billing.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.billing.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/billing")
public class BillingController {

    private final SubscriptionService subscriptionService;

    public BillingController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
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
}
