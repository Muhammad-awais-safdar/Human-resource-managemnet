package com.awais.hr.module.analytics.service;

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
public class WorkforceAnalyticsServiceImpl implements WorkforceAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(WorkforceAnalyticsServiceImpl.class);
    private final DataSource dataSource;

    public WorkforceAnalyticsServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMetricSnapshots() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, metric_key, metric_value, category, snapshot_date, created_at " +
                "FROM workforce_metric_snapshot ORDER BY snapshot_date DESC"
        );
    }

    @Override
    public Map<String, Object> recordMetricSnapshot(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String metricKey = (String) body.get("metricKey");
        if (metricKey == null || metricKey.isBlank()) {
            throw new IllegalArgumentException("Metric key is required.");
        }
        Number valNum = (Number) body.getOrDefault("metricValue", 0.0);
        double val = valNum.doubleValue();
        String category = body.get("category") != null ? (String) body.get("category") : "EXECUTIVE";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO workforce_metric_snapshot (id, metric_key, metric_value, category) VALUES (?, ?, ?, ?)",
                id, metricKey.trim(), val, category
        );
        log.info("Recorded metric snapshot: id={} key={} val={}", id, metricKey, val);
        return Map.of("id", id, "metricKey", metricKey, "metricValue", val);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAttritionTrends() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, department_id, period_year_month, total_headcount, departed_count, attrition_rate, created_at " +
                "FROM attrition_trend ORDER BY period_year_month DESC"
        );
    }

    @Override
    public Map<String, Object> recordAttritionTrend(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String period = (String) body.get("periodYearMonth");
        if (period == null || period.isBlank()) {
            throw new IllegalArgumentException("Period (YYYY-MM) is required.");
        }
        Number totalNum = (Number) body.getOrDefault("totalHeadcount", 0);
        int total = totalNum.intValue();
        Number departedNum = (Number) body.getOrDefault("departedCount", 0);
        int departed = departedNum.intValue();
        String deptId = (String) body.get("departmentId");

        double rate = total > 0 ? ((double) departed / total) * 100.0 : 0.0;
        BigDecimal bdRate = BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP);

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO attrition_trend (id, department_id, period_year_month, total_headcount, departed_count, attrition_rate) VALUES (?, ?, ?, ?, ?, ?)",
                id, deptId, period.trim(), total, departed, bdRate.doubleValue()
        );
        log.info("Recorded attrition trend: period={} rate={}%", period, bdRate);
        return Map.of("id", id, "periodYearMonth", period, "attritionRate", bdRate.doubleValue());
    }
}
