package com.awais.hr.module.workforce.service;

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
 * WorkforcePlanningServiceImpl — all budget and salary calculations use BigDecimal.
 * No double/float used for monetary values.
 */
@Service
@Transactional
public class WorkforcePlanningServiceImpl implements WorkforcePlanningService {

    private static final Logger log = LoggerFactory.getLogger(WorkforcePlanningServiceImpl.class);
    private final DataSource dataSource;

    public WorkforcePlanningServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPlans() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, title, planning_year, department_id, target_headcount, allocated_budget, currency, status, created_at, updated_at " +
                "FROM workforce_plan ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createPlan(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Plan title is required.");
        }
        Number yearNum = (Number) body.getOrDefault("planningYear", Calendar.getInstance().get(Calendar.YEAR));
        int planningYear = yearNum.intValue();
        String deptId = (String) body.get("departmentId");
        Number targetHeadcountNum = (Number) body.getOrDefault("targetHeadcount", 0);
        int targetHeadcount = targetHeadcountNum.intValue();

        // BigDecimal for monetary budget — never double
        BigDecimal allocatedBudget = new BigDecimal(body.getOrDefault("allocatedBudget", "0").toString())
                .setScale(2, RoundingMode.HALF_UP);
        String currency = body.get("currency") != null ? (String) body.get("currency") : "USD";
        String status   = body.get("status")   != null ? (String) body.get("status")   : "DRAFT";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO workforce_plan (id, title, planning_year, department_id, target_headcount, allocated_budget, currency, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id, title.trim(), planningYear, deptId, targetHeadcount, allocatedBudget, currency, status
        );
        log.info("Workforce plan created: id={} title={} budget={}", id, title, allocatedBudget);
        return Map.of("id", id, "title", title, "status", status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPositionBudgets(String planId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, plan_id, job_title, department_id, required_count, budgeted_salary, hiring_quarter, status, created_at " +
                "FROM position_budget WHERE plan_id = ? ORDER BY created_at ASC",
                planId
        );
    }

    @Override
    public Map<String, Object> addPositionBudget(String planId, Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String jobTitle = (String) body.get("jobTitle");
        if (jobTitle == null || jobTitle.isBlank()) {
            throw new IllegalArgumentException("Job title is required.");
        }
        String deptId = (String) body.get("departmentId");
        Number reqCountNum = (Number) body.getOrDefault("requiredCount", 1);
        int requiredCount = reqCountNum.intValue();

        // BigDecimal for salary — never double
        BigDecimal budgetedSalary = new BigDecimal(body.getOrDefault("budgetedSalary", "0").toString())
                .setScale(2, RoundingMode.HALF_UP);
        String hiringQuarter = body.get("hiringQuarter") != null ? (String) body.get("hiringQuarter") : "Q1";
        String status        = body.get("status")        != null ? (String) body.get("status")        : "PLANNED";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO position_budget (id, plan_id, job_title, department_id, required_count, budgeted_salary, hiring_quarter, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id, planId, jobTitle.trim(), deptId, requiredCount, budgetedSalary, hiringQuarter, status
        );
        log.info("Position budget added: id={} planId={} jobTitle={} salary={}", id, planId, jobTitle, budgetedSalary);
        return Map.of("id", id, "planId", planId, "jobTitle", jobTitle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getForecastScenarios(String planId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, plan_id, scenario_name, growth_rate_pct, projected_turnover_pct, projected_headcount, projected_cost, created_at " +
                "FROM workforce_forecast_scenario WHERE plan_id = ? ORDER BY created_at ASC",
                planId
        );
    }

    @Override
    public Map<String, Object> createForecastScenario(String planId, Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String scenarioName = (String) body.get("scenarioName");
        if (scenarioName == null || scenarioName.isBlank()) {
            throw new IllegalArgumentException("Scenario name is required.");
        }

        // Rate inputs as BigDecimal — percentages are monetary-adjacent (tax/projection)
        BigDecimal growthRatePct        = new BigDecimal(body.getOrDefault("growthRatePct", "0").toString()).setScale(4, RoundingMode.HALF_UP);
        BigDecimal projectedTurnoverPct = new BigDecimal(body.getOrDefault("projectedTurnoverPct", "0").toString()).setScale(4, RoundingMode.HALF_UP);

        Map<String, Object> plan = jdbc.queryForMap(
                "SELECT target_headcount, allocated_budget FROM workforce_plan WHERE id = ?", planId
        );
        long baseHeadcount = ((Number) plan.getOrDefault("target_headcount", 0)).longValue();
        BigDecimal baseBudget = plan.get("allocated_budget") instanceof BigDecimal
                ? (BigDecimal) plan.get("allocated_budget")
                : new BigDecimal(plan.getOrDefault("allocated_budget", "0").toString());

        // All arithmetic in BigDecimal — net growth = growthRate - turnoverRate
        BigDecimal netGrowthFactor = BigDecimal.ONE
                .add(growthRatePct.subtract(projectedTurnoverPct).divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP));
        long projectedHeadcount = Math.max(0,
                BigDecimal.valueOf(baseHeadcount).multiply(netGrowthFactor).setScale(0, RoundingMode.HALF_UP).longValue());

        // Budget projection: baseBudget * (1 + growthRate/100)
        BigDecimal growthMultiplier = BigDecimal.ONE.add(growthRatePct.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP));
        BigDecimal projectedCost = baseBudget.multiply(growthMultiplier).setScale(2, RoundingMode.HALF_UP);

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO workforce_forecast_scenario (id, plan_id, scenario_name, growth_rate_pct, projected_turnover_pct, projected_headcount, projected_cost) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, planId, scenarioName.trim(), growthRatePct, projectedTurnoverPct, projectedHeadcount, projectedCost
        );
        log.info("Forecast scenario created: id={} planId={} name={} projectedCost={}", id, planId, scenarioName, projectedCost);
        return Map.of(
                "id",               id,
                "planId",           planId,
                "scenarioName",     scenarioName,
                "projectedHeadcount", projectedHeadcount,
                "projectedCost",    projectedCost
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPlanningAnalytics(String planId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Map<String, Object> plan = jdbc.queryForMap(
                "SELECT target_headcount, allocated_budget FROM workforce_plan WHERE id = ?", planId
        );
        long targetHeadcount = ((Number) plan.getOrDefault("target_headcount", 0)).longValue();
        BigDecimal allocatedBudget = plan.get("allocated_budget") instanceof BigDecimal
                ? (BigDecimal) plan.get("allocated_budget")
                : new BigDecimal(plan.getOrDefault("allocated_budget", "0").toString());

        List<Map<String, Object>> budgets = getPositionBudgets(planId);
        long budgetedPositionsCount = budgets.stream()
                .mapToLong(b -> ((Number) b.getOrDefault("required_count", 0)).longValue())
                .sum();

        // Accumulate total salary using BigDecimal stream reduction
        BigDecimal totalBudgetedSalary = budgets.stream()
                .map(b -> {
                    BigDecimal sal = b.get("budgeted_salary") instanceof BigDecimal
                            ? (BigDecimal) b.get("budgeted_salary")
                            : new BigDecimal(b.getOrDefault("budgeted_salary", "0").toString());
                    long count = ((Number) b.getOrDefault("required_count", 1)).longValue();
                    return sal.multiply(BigDecimal.valueOf(count));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal budgetVariance = allocatedBudget.subtract(totalBudgetedSalary).setScale(2, RoundingMode.HALF_UP);
        long headcountGap = targetHeadcount - budgetedPositionsCount;

        return Map.of(
                "targetHeadcount",       targetHeadcount,
                "budgetedPositionsCount", budgetedPositionsCount,
                "headcountGap",          headcountGap,
                "allocatedBudget",       allocatedBudget,
                "totalBudgetedSalary",   totalBudgetedSalary,
                "budgetVariance",        budgetVariance
        );
    }
}
