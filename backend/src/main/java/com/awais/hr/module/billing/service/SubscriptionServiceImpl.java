package com.awais.hr.module.billing.service;

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
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionServiceImpl.class);
    private final DataSource dataSource;

    public SubscriptionServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSubscription() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, plan_name, billing_cycle, seat_count, amount_usd, status, trial_ends_at, updated_at FROM tenant_subscription LIMIT 1");
        if (list.isEmpty()) {
            return Map.of("planName", "ENTERPRISE_TIER", "billingCycle", "MONTHLY", "seatCount", 50, "amountUsd", 499.00, "status", "ACTIVE");
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> updatePlan(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String plan = (String) body.get("planName");
        if (plan == null || plan.isBlank()) {
            throw new IllegalArgumentException("Plan name is required.");
        }
        String cycle = body.get("billingCycle") != null ? (String) body.get("billingCycle") : "MONTHLY";
        int seats = body.get("seatCount") != null ? ((Number) body.get("seatCount")).intValue() : 50;
        BigDecimal amount = BigDecimal.valueOf(seats * 10.0);

        jdbc.update("DELETE FROM tenant_subscription");
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO tenant_subscription (id, plan_name, billing_cycle, seat_count, amount_usd, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
                id, plan.trim().toUpperCase(), cycle.toUpperCase(), seats, amount
        );

        // Generate invoice record
        String invId = UUID.randomUUID().toString();
        String invNum = "INV-" + (System.currentTimeMillis() / 1000);
        jdbc.update(
                "INSERT INTO billing_invoice (id, invoice_number, amount_paid, currency, status) VALUES (?, ?, ?, 'USD', 'PAID')",
                invId, invNum, amount
        );

        log.info("Subscription updated: plan={} seats={} amount=${}", plan, seats, amount);
        return Map.of("id", id, "planName", plan, "billingCycle", cycle, "seatCount", seats, "amountUsd", amount, "status", "ACTIVE");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInvoices() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, invoice_number, amount_paid, currency, status, created_at FROM billing_invoice ORDER BY created_at DESC");
    }
}
