package com.awais.hr.module.payroll.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.makerchecker.service.MakerCheckerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
public class PayrollServiceImpl implements PayrollService {

    private static final Logger log = LoggerFactory.getLogger(PayrollServiceImpl.class);

    private static final BigDecimal TAX_THRESHOLD = new BigDecimal("3000.00");
    private static final BigDecimal TAX_RATE      = new BigDecimal("0.10");
    private static final BigDecimal ZERO_RATE     = BigDecimal.ZERO;

    private final DataSource dataSource;
    private final MakerCheckerService makerCheckerService;

    public PayrollServiceImpl(DataSource dataSource, MakerCheckerService makerCheckerService) {
        this.dataSource = dataSource;
        this.makerCheckerService = makerCheckerService;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPayslips(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        List<Map<String, Object>> payslips = jdbcTemplate.queryForList(
                "SELECT id, pay_period, net_salary, status FROM payslip WHERE employee_id = ?",
                empId
        );

        if (payslips.isEmpty()) {
            List<Map<String, Object>> salaries = jdbcTemplate.queryForList(
                    "SELECT basic_salary, allowance, deductions FROM salary_structure WHERE employee_id = ? LIMIT 1", empId);

            if (!salaries.isEmpty()) {
                Map<String, Object> salary = salaries.get(0);
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
        }
        return payslips;
    }

    @Override
    @Auditable(action = "PAYROLL_RUN_EXECUTE", entity = "PayrollRun")
    public Map<String, Object> runPayroll(String email) {
        String currentPeriod = java.time.YearMonth.now().toString();
        return initiatePayrollRun(currentPeriod, email);
    }

    @Override
    @Auditable(action = "PAYROLL_RUN_INITIATE", entity = "PayrollRun")
    public Map<String, Object> initiatePayrollRun(String payPeriod, String initiatorEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        // Check if payroll run exists and is locked/disbursed
        List<Map<String, Object>> existingRuns = jdbcTemplate.queryForList(
                "SELECT id, status FROM payroll_run WHERE pay_period = ?", payPeriod
        );

        if (!existingRuns.isEmpty()) {
            String status = (String) existingRuns.get(0).get("status");
            if ("LOCKED".equals(status) || "DISBURSED".equals(status)) {
                throw new IllegalStateException("Payroll Locking Guard: Payroll for period " + payPeriod + " is locked (" + status + ") and cannot be modified or recalculated.");
            }
        }

        List<Map<String, Object>> employees = jdbcTemplate.queryForList(
                "SELECT e.id, e.email, ss.basic_salary, ss.allowance, ss.deductions " +
                        "FROM employee e " +
                        "JOIN salary_structure ss ON e.id = ss.employee_id " +
                        "WHERE e.status NOT IN ('TERMINATED', 'RESIGNED')"
        );

        if (employees.isEmpty()) {
            throw new IllegalStateException("No eligible active employees with salary structure found for payroll run.");
        }

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        List<Map<String, Object>> items = new ArrayList<>();

        for (Map<String, Object> emp : employees) {
            String empId = (String) emp.get("id");
            BigDecimal basic = (BigDecimal) emp.get("basic_salary");
            BigDecimal allowance = (BigDecimal) emp.get("allowance");
            BigDecimal deductions = (BigDecimal) emp.get("deductions");

            BigDecimal gross = basic.add(allowance).setScale(2, RoundingMode.HALF_UP);
            BigDecimal taxRate = gross.compareTo(TAX_THRESHOLD) > 0 ? TAX_RATE : ZERO_RATE;
            BigDecimal tax = gross.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal net = gross.subtract(deductions).subtract(tax).setScale(2, RoundingMode.HALF_UP);

            totalGross = totalGross.add(gross);
            totalTax = totalTax.add(tax);
            totalDeductions = totalDeductions.add(deductions);
            totalNet = totalNet.add(net);

            items.add(Map.of(
                    "employeeId", empId,
                    "basic", basic,
                    "allowance", allowance,
                    "gross", gross,
                    "tax", tax,
                    "deductions", deductions,
                    "net", net
            ));
        }

        String runId = UUID.randomUUID().toString();
        if (!existingRuns.isEmpty()) {
            runId = (String) existingRuns.get(0).get("id");
            jdbcTemplate.update(
                    "UPDATE payroll_run SET status = 'CALCULATED', total_employees = ?, total_gross = ?, total_tax = ?, total_deductions = ?, total_net = ?, initiated_by = ? WHERE id = ?",
                    employees.size(), totalGross, totalTax, totalDeductions, totalNet, initiatorEmail, runId
            );
        } else {
            jdbcTemplate.update(
                    "INSERT INTO payroll_run (id, pay_period, status, total_employees, total_gross, total_tax, total_deductions, total_net, initiated_by) " +
                            "VALUES (?, ?, 'CALCULATED', ?, ?, ?, ?, ?, ?)",
                    runId, payPeriod, employees.size(), totalGross, totalTax, totalDeductions, totalNet, initiatorEmail
            );
        }

        makerCheckerService.submitRequest(
                "PAYROLL_RUN", "PayrollRun", runId,
                Map.of("payPeriod", payPeriod, "totalNet", totalNet, "totalEmployees", employees.size()),
                initiatorEmail
        );

        log.info("Payroll run initiated: runId={} period={} totalEmployees={} totalNet={} initiatedBy={}", runId, payPeriod, employees.size(), totalNet, initiatorEmail);

        return Map.of(
                "payrollRunId", runId,
                "payPeriod", payPeriod,
                "status", "CALCULATED",
                "totalEmployees", employees.size(),
                "totalGross", totalGross,
                "totalTax", totalTax,
                "totalDeductions", totalDeductions,
                "totalNet", totalNet,
                "items", items
        );
    }

    @Override
    @Auditable(action = "PAYROLL_RUN_APPROVE", entity = "PayrollRun")
    public Map<String, Object> approvePayrollRun(String payrollRunId, String approverEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        Map<String, Object> run = jdbcTemplate.queryForMap(
                "SELECT pay_period, status, initiated_by FROM payroll_run WHERE id = ?", payrollRunId
        );

        String initiatorEmail = (String) run.get("initiated_by");
        String payPeriod = (String) run.get("pay_period");
        String currentStatus = (String) run.get("status");

        if ("LOCKED".equals(currentStatus) || "DISBURSED".equals(currentStatus)) {
            throw new IllegalStateException("Payroll run " + payrollRunId + " is already locked or disbursed.");
        }

        // 1. Enforce Maker-Checker Dual Control (Maker != Checker)
        if (initiatorEmail != null && initiatorEmail.equalsIgnoreCase(approverEmail)) {
            throw new IllegalArgumentException("Maker-Checker Violation: Initiator cannot approve their own payroll run.");
        }

        // 2. Lock Payroll Run & Snapshot Items to payslip_ledger
        jdbcTemplate.update(
                "UPDATE payroll_run SET status = 'LOCKED', approved_by = ?, locked_at = NOW(), disbursed_at = NOW() WHERE id = ?",
                approverEmail, payrollRunId
        );

        List<Map<String, Object>> employees = jdbcTemplate.queryForList(
                "SELECT e.id, ss.basic_salary, ss.allowance, ss.deductions " +
                        "FROM employee e " +
                        "JOIN salary_structure ss ON e.id = ss.employee_id " +
                        "WHERE e.status NOT IN ('TERMINATED', 'RESIGNED')"
        );

        for (Map<String, Object> emp : employees) {
            String empId = (String) emp.get("id");
            BigDecimal basic = (BigDecimal) emp.get("basic_salary");
            BigDecimal allowance = (BigDecimal) emp.get("allowance");
            BigDecimal deductions = (BigDecimal) emp.get("deductions");

            BigDecimal gross = basic.add(allowance).setScale(2, RoundingMode.HALF_UP);
            BigDecimal taxRate = gross.compareTo(TAX_THRESHOLD) > 0 ? TAX_RATE : ZERO_RATE;
            BigDecimal tax = gross.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal net = gross.subtract(deductions).subtract(tax).setScale(2, RoundingMode.HALF_UP);

            String ledgerId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO payslip_ledger (id, payroll_run_id, employee_id, pay_period, basic_salary, allowance, gross_salary, tax_amount, deductions, net_salary, status) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID')",
                    ledgerId, payrollRunId, empId, payPeriod, basic, allowance, gross, tax, deductions, net
            );

            // Upsert into active payslips
            jdbcTemplate.update(
                    "INSERT INTO payslip (id, employee_id, pay_period, net_salary, status) VALUES (?, ?, ?, ?, 'PAID') " +
                            "ON DUPLICATE KEY UPDATE net_salary = VALUES(net_salary), status = 'PAID'",
                    UUID.randomUUID().toString(), empId, payPeriod, net
            );
        }

        log.info("Payroll run approved & locked: runId={} period={} approvedBy={}", payrollRunId, payPeriod, approverEmail);

        return Map.of(
                "payrollRunId", payrollRunId,
                "payPeriod", payPeriod,
                "status", "LOCKED",
                "approvedBy", approverEmail
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPayrollRuns() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, pay_period, status, total_employees, total_gross, total_tax, total_deductions, total_net, initiated_by, approved_by, locked_at, created_at " +
                        "FROM payroll_run ORDER BY pay_period DESC"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPayrollRunDetails(String payrollRunId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        Map<String, Object> run = jdbcTemplate.queryForMap(
                "SELECT id, pay_period, status, total_employees, total_gross, total_tax, total_deductions, total_net, initiated_by, approved_by, locked_at FROM payroll_run WHERE id = ?",
                payrollRunId
        );

        List<Map<String, Object>> items = jdbcTemplate.queryForList(
                "SELECT l.id, l.employee_id, l.basic_salary, l.allowance, l.gross_salary, l.tax_amount, l.deductions, l.net_salary, l.status, " +
                        "e.first_name, e.last_name, e.email " +
                        "FROM payslip_ledger l JOIN employee e ON l.employee_id = e.id WHERE l.payroll_run_id = ?",
                payrollRunId
        );

        Map<String, Object> details = new HashMap<>(run);
        details.put("items", items);
        return details;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPayslips() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT p.id, p.pay_period, p.net_salary, p.status, e.first_name, e.last_name, e.email " +
                        "FROM payslip p JOIN employee e ON p.employee_id = e.id ORDER BY p.pay_period DESC"
        );
    }
}
