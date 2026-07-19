package com.awais.hr.module.payroll.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class PayrollServiceImpl implements PayrollService {

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
            Map<String, Object> salary = jdbcTemplate.queryForMap("SELECT basic_salary, allowance, deductions FROM salary_structure WHERE employee_id = ? LIMIT 1", empId);
            double basic = ((java.math.BigDecimal) salary.get("basic_salary")).doubleValue();
            double allowance = ((java.math.BigDecimal) salary.get("allowance")).doubleValue();
            double deductions = ((java.math.BigDecimal) salary.get("deductions")).doubleValue();
            double net = basic + allowance - deductions;

            jdbcTemplate.update("INSERT INTO payslip (id, employee_id, pay_period, net_salary, status) VALUES (?, ?, 'June 2026', ?, 'PAID')",
                    UUID.randomUUID().toString(), empId, net);
            
            payslips = jdbcTemplate.queryForList("SELECT id, pay_period, net_salary, status FROM payslip WHERE employee_id = ?", empId);
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
        double basic      = ((java.math.BigDecimal) salary.get("basic_salary")).doubleValue();
        double allowance  = ((java.math.BigDecimal) salary.get("allowance")).doubleValue();
        double deductions = ((java.math.BigDecimal) salary.get("deductions")).doubleValue();

        // Statutory income tax slab: 10% on income > 3000
        double grossPay = basic + allowance;
        double taxRate  = grossPay > 3000 ? 0.10 : 0.0;
        double taxAmount = grossPay * taxRate;
        double net = grossPay - deductions - taxAmount;

        String period = java.time.YearMonth.now().toString();
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO payslip (id, employee_id, pay_period, net_salary, status) VALUES (?, ?, ?, ?, 'PAID')",
                id, empId, period, net
        );

        return Map.of(
                "payslipId", id,
                "period", period,
                "gross", grossPay,
                "taxAmount", taxAmount,
                "deductions", deductions,
                "netSalary", net
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

