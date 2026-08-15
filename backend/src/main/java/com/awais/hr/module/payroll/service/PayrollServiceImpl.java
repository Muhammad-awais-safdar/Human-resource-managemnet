package com.awais.hr.module.payroll.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * PayrollServiceImpl — all monetary arithmetic uses BigDecimal exclusively.
 * NO double/float conversions for salary, tax, or net pay.
 */
@Service
@Transactional
public class PayrollServiceImpl implements PayrollService {

    private static final Logger log = LoggerFactory.getLogger(PayrollServiceImpl.class);

    // Statutory slab threshold and rate as exact BigDecimal constants
    private static final BigDecimal TAX_THRESHOLD = new BigDecimal("3000.00");
    private static final BigDecimal TAX_RATE      = new BigDecimal("0.10");
    private static final BigDecimal ZERO_RATE     = BigDecimal.ZERO;

    private final DataSource dataSource;

    public PayrollServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    @Override
    public List<Map<String, Object>> getPayslips(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        List<Map<String, Object>> payslips = jdbcTemplate.queryForList(
                "SELECT id, pay_period, net_salary, status FROM payslip WHERE employee_id = ?",
                empId
        );

        if (payslips.isEmpty()) {
            Map<String, Object> salary = jdbcTemplate.queryForMap(
                    "SELECT basic_salary, allowance, deductions FROM salary_structure WHERE employee_id = ? LIMIT 1", empId);

            // BigDecimal only — no double conversion
            BigDecimal basic      = (BigDecimal) salary.get("basic_salary");
            BigDecimal allowance  = (BigDecimal) salary.get("allowance");
            BigDecimal deductions = (BigDecimal) salary.get("deductions");
            BigDecimal net        = basic.add(allowance).subtract(deductions).setScale(2, RoundingMode.HALF_UP);

            jdbcTemplate.update(
                    "INSERT INTO payslip (id, employee_id, pay_period, net_salary, status) VALUES (?, ?, 'June 2026', ?, 'PAID')",
                    UUID.randomUUID().toString(), empId, net);

            payslips = jdbcTemplate.queryForList(
                    "SELECT id, pay_period, net_salary, status FROM payslip WHERE employee_id = ?", empId);
        }
        return payslips;
    }

    @Override
    public Map<String, Object> runPayroll(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);

        List<Map<String, Object>> salaries = jdbcTemplate.queryForList(
                "SELECT basic_salary, allowance, deductions FROM salary_structure WHERE employee_id = ?", empId);

        if (salaries.isEmpty()) {
            throw new IllegalStateException("No salary structure found for employee.");
        }

        Map<String, Object> salary = salaries.get(0);

        // BigDecimal only — exact decimal arithmetic for all monetary values
        BigDecimal basic      = (BigDecimal) salary.get("basic_salary");
        BigDecimal allowance  = (BigDecimal) salary.get("allowance");
        BigDecimal deductions = (BigDecimal) salary.get("deductions");

        BigDecimal grossPay   = basic.add(allowance).setScale(2, RoundingMode.HALF_UP);
        BigDecimal taxRate    = grossPay.compareTo(TAX_THRESHOLD) > 0 ? TAX_RATE : ZERO_RATE;
        BigDecimal taxAmount  = grossPay.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netSalary  = grossPay.subtract(deductions).subtract(taxAmount).setScale(2, RoundingMode.HALF_UP);

        String period = java.time.YearMonth.now().toString();
        String id     = UUID.randomUUID().toString();

        jdbcTemplate.update(
                "INSERT INTO payslip (id, employee_id, pay_period, net_salary, status) VALUES (?, ?, ?, ?, 'PAID')",
                id, empId, period, netSalary);

        log.info("Payroll run complete: empId={} period={} gross={} tax={} net={}", empId, period, grossPay, taxAmount, netSalary);

        return Map.of(
                "payslipId", id,
                "period",    period,
                "gross",     grossPay,
                "taxAmount", taxAmount,
                "deductions", deductions,
                "netSalary", netSalary
        );
    }

    @Override
    public List<Map<String, Object>> getAllPayslips() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT p.id, p.pay_period, p.net_salary, p.status, e.first_name, e.last_name, e.email " +
                "FROM payslip p JOIN employee e ON p.employee_id = e.id ORDER BY p.pay_period DESC"
        );
    }
}
