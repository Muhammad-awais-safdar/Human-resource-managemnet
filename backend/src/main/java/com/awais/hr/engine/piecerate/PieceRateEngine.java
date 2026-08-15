package com.awais.hr.engine.piecerate;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Service
public class PieceRateEngine {

    private final DataSource dataSource;

    public PieceRateEngine(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public BigDecimal calculatePiecePay(int quantity, BigDecimal unitRate, BigDecimal qualityFactor) {
        if (quantity <= 0 || unitRate == null) return BigDecimal.ZERO;
        if (qualityFactor == null) qualityFactor = BigDecimal.ONE;

        BigDecimal basePay = unitRate.multiply(BigDecimal.valueOf(quantity));
        return basePay.multiply(qualityFactor).setScale(2, RoundingMode.HALF_UP);
    }

    public String recordPieceRateOutput(String employeeId, String productionUnit, int quantity, BigDecimal unitRate, BigDecimal qualityFactor, LocalDate workDate) {
        BigDecimal totalPay = calculatePiecePay(quantity, unitRate, qualityFactor);
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO piece_rate_entry (id, employee_id, production_unit, quantity, unit_rate, quality_factor, total_pay, work_date) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id, employeeId, productionUnit, quantity, unitRate, qualityFactor, totalPay, Date.valueOf(workDate)
        );
        return id;
    }

    public List<Map<String, Object>> getEmployeePiecePay(String employeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, production_unit, quantity, unit_rate, quality_factor, total_pay, work_date " +
                "FROM piece_rate_entry WHERE employee_id = ? ORDER BY work_date DESC",
                employeeId
        );
    }
}
