package com.awais.hr.module.compensation.service;

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
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class CompensationServiceImpl implements CompensationService {

    private static final Logger log = LoggerFactory.getLogger(CompensationServiceImpl.class);
    private final DataSource dataSource;
    private final MakerCheckerService makerCheckerService;

    public CompensationServiceImpl(DataSource dataSource, MakerCheckerService makerCheckerService) {
        this.dataSource = dataSource;
        this.makerCheckerService = makerCheckerService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBands() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, grade, min_salary, max_salary, currency, created_at " +
                        "FROM compensation_band ORDER BY grade ASC"
        );
    }

    @Override
    @Auditable(action = "COMPENSATION_BAND_ADD", entity = "CompensationBand")
    public void addBand(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO compensation_band (id, grade, min_salary, max_salary, currency) VALUES (?, ?, ?, ?, ?) " +
                        "ON DUPLICATE KEY UPDATE min_salary = VALUES(min_salary), max_salary = VALUES(max_salary)",
                id,
                body.get("grade"),
                new BigDecimal(String.valueOf(body.get("minSalary"))),
                new BigDecimal(String.valueOf(body.get("maxSalary"))),
                body.getOrDefault("currency", "USD")
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSalaryReviews() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT sr.id, sr.employee_id, sr.current_salary, sr.proposed_salary, sr.merit_percentage, " +
                        "sr.reason, sr.status, sr.effective_date, sr.created_at, " +
                        "e.first_name, e.last_name, e.email " +
                        "FROM salary_review sr " +
                        "JOIN employee e ON sr.employee_id = e.id " +
                        "ORDER BY sr.created_at DESC"
        );
    }

    @Override
    @Auditable(action = "SALARY_REVISION_PROPOSE", entity = "SalaryReview")
    public void submitReview(String requesterEmail, Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = (String) body.get("employeeId");
        BigDecimal currentSalary = new BigDecimal(String.valueOf(body.get("currentSalary")));
        BigDecimal proposedSalary = new BigDecimal(String.valueOf(body.get("proposedSalary")));

        if (proposedSalary.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Proposed salary must be greater than zero.");
        }

        // Calculate merit percentage
        BigDecimal meritPct = null;
        if (currentSalary.compareTo(BigDecimal.ZERO) > 0) {
            meritPct = proposedSalary.subtract(currentSalary)
                    .multiply(new BigDecimal("100"))
                    .divide(currentSalary, 2, RoundingMode.HALF_UP);
        }

        String effectiveDateStr = (String) body.getOrDefault("effectiveDate", LocalDate.now().toString());
        String reason = (String) body.getOrDefault("reason", "Salary Revision Proposal");
        String id = UUID.randomUUID().toString();

        jdbc.update(
                "INSERT INTO salary_review (id, employee_id, current_salary, proposed_salary, merit_percentage, reason, effective_date, status) " +
                        "VALUES (?, ?, ?, ?, ?, ?, CAST(? AS DATE), 'PENDING')",
                id, employeeId, currentSalary, proposedSalary, meritPct, reason, effectiveDateStr
        );

        // Store proposed_by metadata in custom metadata / maker-checker request tracker
        makerCheckerService.submitRequest(
                "SALARY_REVISION", "SalaryReview", id,
                Map.of("employeeId", employeeId, "currentSalary", currentSalary, "proposedSalary", proposedSalary, "effectiveDate", effectiveDateStr),
                requesterEmail
        );

        log.info("Salary revision proposed: id={} employeeId={} proposedBy={} proposedSalary={}", id, employeeId, requesterEmail, proposedSalary);
    }

    @Override
    @Auditable(action = "SALARY_REVISION_ACTION", entity = "SalaryReview")
    public void actionReview(String reviewerEmail, String reviewId, String status) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actionStatus = status.toUpperCase().trim();

        Map<String, Object> review = jdbc.queryForMap(
                "SELECT employee_id, current_salary, proposed_salary, effective_date, reason FROM salary_review WHERE id = ?", reviewId
        );

        String employeeId = (String) review.get("employee_id");
        BigDecimal proposedSalary = new BigDecimal(String.valueOf(review.get("proposedSalary")));
        java.sql.Date effectiveSqlDate = (java.sql.Date) review.get("effective_date");
        String effectiveDate = effectiveSqlDate != null ? effectiveSqlDate.toString() : LocalDate.now().toString();
        String reason = (String) review.get("reason");

        // Fetch proposer from maker_checker_request or employee requester
        List<Map<String, Object>> requests = jdbc.queryForList(
                "SELECT created_by FROM maker_checker_request WHERE resource_type = 'SalaryReview' AND resource_id = ? ORDER BY created_at DESC",
                reviewId
        );

        String proposerEmail = requests.isEmpty() ? null : (String) requests.get(0).get("created_by");

        // 1. Enforce Maker-Checker Dual Control (Maker != Checker)
        if (proposerEmail != null && proposerEmail.equalsIgnoreCase(reviewerEmail)) {
            throw new IllegalArgumentException("Maker-Checker Violation: You cannot approve or reject a salary revision that you proposed.");
        }

        String reviewerId = jdbc.queryForObject(
                "SELECT id FROM employee WHERE email = ?", String.class, reviewerEmail
        );

        jdbc.update(
                "UPDATE salary_review SET status = ?, reviewed_by = ? WHERE id = ?",
                actionStatus, reviewerId, reviewId
        );

        // 2. On Approval: Update salary_structure & log immutable employee_salary_history
        if ("APPROVED".equals(actionStatus)) {
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM salary_structure WHERE employee_id = ?", Integer.class, employeeId
            );

            if (count != null && count > 0) {
                jdbc.update(
                        "UPDATE salary_structure SET basic_salary = ?, net_salary = basic_salary + allowance - deductions WHERE employee_id = ?",
                        proposedSalary, employeeId
                );
            } else {
                jdbc.update(
                        "INSERT INTO salary_structure (id, employee_id, basic_salary, allowance, deductions) VALUES (?, ?, ?, 0.00, 0.00)",
                        UUID.randomUUID().toString(), employeeId, proposedSalary
                );
            }

            jdbc.update(
                    "INSERT INTO employee_salary_history (id, employee_id, basic_salary, allowance, deductions, net_salary, currency, effective_date, revision_reason, proposed_by, approved_by) " +
                            "VALUES (?, ?, ?, 0.00, 0.00, ?, 'USD', CAST(? AS DATE), ?, ?, ?)",
                    UUID.randomUUID().toString(), employeeId, proposedSalary, proposedSalary, effectiveDate, reason, proposerEmail != null ? proposerEmail : "SYSTEM", reviewerEmail
            );

            log.info("Salary revision approved & ledger updated: reviewId={} employeeId={} newSalary={} approvedBy={}", reviewId, employeeId, proposedSalary, reviewerEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSalaryHistory(String employeeId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, basic_salary, allowance, deductions, net_salary, currency, effective_date, revision_reason, proposed_by, approved_by, created_at " +
                        "FROM employee_salary_history WHERE employee_id = ? ORDER BY effective_date DESC, created_at DESC",
                employeeId
        );
    }
}
