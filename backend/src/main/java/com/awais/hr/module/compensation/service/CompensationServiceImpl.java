package com.awais.hr.module.compensation.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class CompensationServiceImpl implements CompensationService {

    private final DataSource dataSource;

    public CompensationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Map<String, Object>> getBands() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT id, grade, min_salary, max_salary, currency, created_at " +
            "FROM compensation_band ORDER BY grade ASC"
        );
    }

    @Override
    public void addBand(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO compensation_band (id, grade, min_salary, max_salary, currency) VALUES (?, ?, ?, ?, ?) " +
            "ON CONFLICT (grade) DO UPDATE SET min_salary = EXCLUDED.min_salary, max_salary = EXCLUDED.max_salary",
            id,
            body.get("grade"),
            new BigDecimal(String.valueOf(body.get("minSalary"))),
            new BigDecimal(String.valueOf(body.get("maxSalary"))),
            body.getOrDefault("currency", "USD")
        );
    }

    @Override
    public List<Map<String, Object>> getSalaryReviews() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT sr.id, sr.current_salary, sr.proposed_salary, sr.merit_percentage, " +
            "sr.reason, sr.status, sr.effective_date, sr.created_at, " +
            "e.first_name, e.last_name, e.email " +
            "FROM salary_review sr " +
            "JOIN employee e ON sr.employee_id = e.id " +
            "ORDER BY sr.created_at DESC"
        );
    }

    @Override
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
                       .divide(currentSalary, 2, java.math.RoundingMode.HALF_UP);
        }

        String effectiveDateStr = (String) body.getOrDefault("effectiveDate", null);
        String id = UUID.randomUUID().toString();

        jdbc.update(
            "INSERT INTO salary_review (id, employee_id, current_salary, proposed_salary, merit_percentage, reason, effective_date) " +
            "VALUES (?, ?, ?, ?, ?, ?, CAST(? AS DATE))",
            id, employeeId, currentSalary, proposedSalary, meritPct,
            body.getOrDefault("reason", null), effectiveDateStr
        );
    }

    @Override
    public void actionReview(String reviewerEmail, String reviewId, String status) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String reviewerId = jdbc.queryForObject(
            "SELECT id FROM employee WHERE email = ?", String.class, reviewerEmail
        );
        jdbc.update(
            "UPDATE salary_review SET status = ?, reviewed_by = ? WHERE id = ?",
            status, reviewerId, reviewId
        );
    }
}
