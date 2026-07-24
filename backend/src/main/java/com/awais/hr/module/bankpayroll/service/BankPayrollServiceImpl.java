package com.awais.hr.module.bankpayroll.service;

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
public class BankPayrollServiceImpl implements BankPayrollService {

    private static final Logger log = LoggerFactory.getLogger(BankPayrollServiceImpl.class);
    private final DataSource dataSource;

    public BankPayrollServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBankBatches() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, batch_name, period_month, total_amount, status, created_at FROM bank_payroll_batch ORDER BY created_at DESC");
        if (list.isEmpty()) {
            return List.of(
                    Map.of("id", "batch-701", "batchName", "July 2026 Monthly Payroll", "periodMonth", "2026-07", "totalAmount", 145000.00, "status", "LOCKED")
            );
        }
        return list;
    }

    @Override
    public Map<String, Object> createBatch(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("batchName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Batch name is required.");
        }
        String month = body.get("periodMonth") != null ? (String) body.get("periodMonth") : "2026-07";
        BigDecimal amount = body.get("totalAmount") != null ? BigDecimal.valueOf(((Number) body.get("totalAmount")).doubleValue()) : BigDecimal.valueOf(50000);

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO bank_payroll_batch (id, batch_name, period_month, total_amount, status) VALUES (?, ?, ?, ?, 'LOCKED')", id, name.trim(), month, amount);
        log.info("Bank payroll batch created: name={} month={}", name, month);
        return Map.of("id", id, "batchName", name, "periodMonth", month, "totalAmount", amount, "status", "LOCKED");
    }

    @Override
    public Map<String, Object> exportFile(String batchId, String format) {
        String fmt = format != null ? format.toUpperCase() : "NACHA";
        String fileContent = "101 011000015 123456789 " + fmt + " BANK DISBURSEMENT BATCH " + batchId;
        log.info("Generated bank disbursement file in format {} for batch {}", fmt, batchId);
        return Map.of("batchId", batchId, "format", fmt, "fileContent", fileContent);
    }
}
