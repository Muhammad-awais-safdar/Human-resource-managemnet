package com.awais.hr.module.benefits.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class BenefitsServiceImpl implements BenefitsService {

    private final DataSource dataSource;

    public BenefitsServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Cacheable(value = "benefit_plans", key = "'active'")
    public List<Map<String, Object>> getPlans() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT id, name, category, description, monthly_cost, employer_share, is_active, created_at " +
            "FROM benefit_plan WHERE is_active = TRUE ORDER BY category ASC, name ASC"
        );
    }

    @Override
    @CacheEvict(value = "benefit_plans", allEntries = true)
    public void addPlan(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        BigDecimal monthlyCost = new BigDecimal(String.valueOf(body.getOrDefault("monthlyCost", 0)));
        BigDecimal employerShare = new BigDecimal(String.valueOf(body.getOrDefault("employerShare", 100)));
        jdbc.update(
            "INSERT INTO benefit_plan (id, name, category, description, monthly_cost, employer_share) " +
            "VALUES (?, ?, ?, ?, ?, ?)",
            id, body.get("name"), body.get("category"),
            body.getOrDefault("description", null), monthlyCost, employerShare
        );
    }

    @Override
    public List<Map<String, Object>> getMyEnrollments(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT be.id, be.status, be.enrolled_at, " +
            "bp.name AS plan_name, bp.category, bp.monthly_cost, bp.employer_share " +
            "FROM benefit_enrollment be " +
            "JOIN benefit_plan bp ON be.plan_id = bp.id " +
            "JOIN employee e ON be.employee_id = e.id " +
            "WHERE e.email = ? ORDER BY be.enrolled_at DESC",
            email
        );
    }

    @Override
    public List<Map<String, Object>> getAllEnrollments() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT be.id, be.status, be.enrolled_at, " +
            "bp.name AS plan_name, bp.category, bp.monthly_cost, " +
            "e.first_name, e.last_name, e.email " +
            "FROM benefit_enrollment be " +
            "JOIN benefit_plan bp ON be.plan_id = bp.id " +
            "JOIN employee e ON be.employee_id = e.id " +
            "ORDER BY be.enrolled_at DESC"
        );
    }

    @Override
    @CacheEvict(value = "benefit_plans", allEntries = true)
    public void enroll(String email, String planId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = jdbc.queryForObject(
            "SELECT id FROM employee WHERE email = ?", String.class, email
        );
        // Check eligibility: plan must exist and be active
        Integer planExists = jdbc.queryForObject(
            "SELECT COUNT(*) FROM benefit_plan WHERE id = ? AND is_active = TRUE",
            Integer.class, planId
        );
        if (planExists == null || planExists == 0) {
            throw new IllegalArgumentException("Benefit plan not found or is inactive.");
        }
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO benefit_enrollment (id, employee_id, plan_id) VALUES (?, ?, ?) " +
            "ON CONFLICT (employee_id, plan_id) DO UPDATE SET status = 'ACTIVE', ended_at = NULL",
            id, employeeId, planId
        );
    }

    @Override
    @CacheEvict(value = "benefit_plans", allEntries = true)
    public void unenroll(String email, String planId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = jdbc.queryForObject(
            "SELECT id FROM employee WHERE email = ?", String.class, email
        );
        jdbc.update(
            "UPDATE benefit_enrollment SET status = 'ENDED', ended_at = NOW() " +
            "WHERE employee_id = ? AND plan_id = ?",
            employeeId, planId
        );
    }
}
