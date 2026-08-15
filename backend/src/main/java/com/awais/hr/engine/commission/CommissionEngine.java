package com.awais.hr.engine.commission;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CommissionEngine {

    private final DataSource dataSource;

    public CommissionEngine(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public BigDecimal calculateCommission(BigDecimal salesRevenue, BigDecimal commissionRatePercent, BigDecimal tierMultiplier) {
        if (salesRevenue == null || salesRevenue.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        if (commissionRatePercent == null) commissionRatePercent = BigDecimal.valueOf(5.0);
        if (tierMultiplier == null) tierMultiplier = BigDecimal.ONE;

        BigDecimal base = salesRevenue.multiply(commissionRatePercent).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        return base.multiply(tierMultiplier).setScale(2, RoundingMode.HALF_UP);
    }

    public String recordCommissionRule(String ruleName, String industryCode, String ruleType, BigDecimal targetAmount, BigDecimal ratePercent, BigDecimal tierMultiplier) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO commission_rule (id, rule_name, industry_code, rule_type, target_amount, commission_rate, tier_multiplier) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, ruleName, industryCode, ruleType, targetAmount, ratePercent, tierMultiplier
        );
        return id;
    }

    public List<Map<String, Object>> getRulesByIndustry(String industryCode) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, rule_name, rule_type, target_amount, commission_rate, tier_multiplier FROM commission_rule WHERE industry_code = ? AND status = 'ACTIVE'",
                industryCode
        );
    }
}
