package com.awais.hr.module.billing.service;

import java.util.List;
import java.util.Map;

public interface SubscriptionService {
    Map<String, Object> getSubscription();
    Map<String, Object> updatePlan(Map<String, Object> body);
    List<Map<String, Object>> getInvoices();
}
