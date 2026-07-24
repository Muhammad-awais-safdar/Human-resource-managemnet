package com.awais.hr.module.bankpayroll.service;

import java.util.List;
import java.util.Map;

public interface BankPayrollService {
    List<Map<String, Object>> getBankBatches();
    Map<String, Object> createBatch(Map<String, Object> body);
    Map<String, Object> exportFile(String batchId, String format);
}
