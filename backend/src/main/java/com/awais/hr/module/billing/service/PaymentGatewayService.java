package com.awais.hr.module.billing.service;

import java.util.List;
import java.util.Map;

public interface PaymentGatewayService {
    Map<String, Object> createCheckoutSession(Map<String, Object> request);
    Map<String, Object> handleWebhook(String provider, String payload, String signature);
    List<Map<String, Object>> getPaymentMethods();
    Map<String, Object> addPaymentMethod(Map<String, Object> body);
}
