package com.awais.hr.module.bankpayroll.service;

import java.util.Map;

public interface PayrollDisbursementGatewayService {

    Map<String, Object> configureProvider(Map<String, Object> body);

    Map<String, Object> executeDisbursement(String batchId, Map<String, Object> body, String idempotencyKeyHeader);

    Map<String, Object> getBatchStatus(String batchId);
}
