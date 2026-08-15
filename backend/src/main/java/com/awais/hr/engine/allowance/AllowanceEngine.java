package com.awais.hr.engine.allowance;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Service
public class AllowanceEngine {

    private final DataSource dataSource;

    public AllowanceEngine(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public BigDecimal calculateAllowance(BigDecimal distanceKm, BigDecimal unitRate) {
        if (distanceKm == null || distanceKm.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        if (unitRate == null) unitRate = BigDecimal.valueOf(0.55); // Default $0.55 / km
        return distanceKm.multiply(unitRate).setScale(2, RoundingMode.HALF_UP);
    }

    public String recordAllowance(String employeeId, String allowanceType, BigDecimal distanceKm, BigDecimal unitRate, LocalDate tripDate) {
        BigDecimal total = calculateAllowance(distanceKm, unitRate);
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO allowance_ledger (id, employee_id, allowance_type, distance_km, unit_rate, total_amount, trip_date, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED')",
                id, employeeId, allowanceType, distanceKm, unitRate, total, Date.valueOf(tripDate)
        );
        return id;
    }

    public List<Map<String, Object>> getEmployeeAllowances(String employeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, allowance_type, distance_km, unit_rate, total_amount, trip_date, status " +
                "FROM allowance_ledger WHERE employee_id = ? ORDER BY trip_date DESC",
                employeeId
        );
    }
}
