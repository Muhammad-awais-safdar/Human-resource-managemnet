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
        Number budgetNum = (Number) body.getOrDefault("allocatedBudget", 0.0);
        double allocatedBudget = budgetNum.doubleValue();
        String currency = body.get("currency") != null ? (String) body.get("currency") : "USD";
        String status = body.get("status") != null ? (String) body.get("status") : "DRAFT";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO workforce_plan (id, title, planning_year, department_id, target_headcount, allocated_budget, currency, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id, title.trim(), planningYear, deptId, targetHeadcount, allocatedBudget, currency, status
        );
        log.info("Workforce plan created: id={} title={}", id, title);
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
        Number salaryNum = (Number) body.getOrDefault("budgetedSalary", 0.0);
        double budgetedSalary = salaryNum.doubleValue();
        String hiringQuarter = body.get("hiringQuarter") != null ? (String) body.get("hiringQuarter") : "Q1";
        String status = body.get("status") != null ? (String) body.get("status") : "PLANNED";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO position_budget (id, plan_id, job_title, department_id, required_count, budgeted_salary, hiring_quarter, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id, planId, jobTitle.trim(), deptId, requiredCount, budgetedSalary, hiringQuarter, status
        );
        log.info("Position budget added: id={} planId={} jobTitle={}", id, planId, jobTitle);
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
        Number growthNum = (Number) body.getOrDefault("growthRatePct", 0.0);
        double growthRatePct = growthNum.doubleValue();
        Number turnoverNum = (Number) body.getOrDefault("projectedTurnoverPct", 0.0);
        double projectedTurnoverPct = turnoverNum.doubleValue();

        // Fetch current plan target headcount and budget
        Map<String, Object> plan = jdbc.queryForMap(
                "SELECT target_headcount, allocated_budget FROM workforce_plan WHERE id = ?", planId
        );
        long baseHeadcount = ((Number) plan.getOrDefault("target_headcount", 0)).longValue();
        double baseBudget = ((Number) plan.getOrDefault("allocated_budget", 0.0)).doubleValue();

        long projectedHeadcount = Math.max(0, Math.round(baseHeadcount * (1 + (growthRatePct - projectedTurnoverPct) / 100.0)));
        double projectedCost = BigDecimal.valueOf(baseBudget * (1 + growthRatePct / 100.0))
                .setScale(2, RoundingMode.HALF_UP).doubleValue();

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO workforce_forecast_scenario (id, plan_id, scenario_name, growth_rate_pct, projected_turnover_pct, projected_headcount, projected_cost) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, planId, scenarioName.trim(), growthRatePct, projectedTurnoverPct, projectedHeadcount, projectedCost
        );
        log.info("Forecast scenario created: id={} planId={} name={}", id, planId, scenarioName);
        return Map.of(
                "id", id,
                "planId", planId,
                "scenarioName", scenarioName,
                "projectedHeadcount", projectedHeadcount,
                "projectedCost", projectedCost
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
        double allocatedBudget = ((Number) plan.getOrDefault("allocated_budget", 0.0)).doubleValue();

        List<Map<String, Object>> budgets = getPositionBudgets(planId);
        long budgetedPositionsCount = budgets.stream()
                .mapToLong(b -> ((Number) b.getOrDefault("required_count", 0)).longValue())
                .sum();
        double totalBudgetedSalary = budgets.stream()
                .mapToDouble(b -> {
                    double salary = ((Number) b.getOrDefault("budgeted_salary", 0.0)).doubleValue();
                    long count = ((Number) b.getOrDefault("required_count", 1)).longValue();
                    return salary * count;
                })
                .sum();

        double budgetVariance = allocatedBudget - totalBudgetedSalary;
        long headcountGap = targetHeadcount - budgetedPositionsCount;

        return Map.of(
                "targetHeadcount", targetHeadcount,
                "budgetedPositionsCount", budgetedPositionsCount,
                "headcountGap", headcountGap,
                "allocatedBudget", allocatedBudget,
                "totalBudgetedSalary", totalBudgetedSalary,
                "budgetVariance", budgetVariance
        );
    }
}
