package com.awais.hr.module.compliance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ComplianceManagementServiceImpl implements ComplianceManagementService {

    private static final Logger log = LoggerFactory.getLogger(ComplianceManagementServiceImpl.class);
    private final DataSource dataSource;

    public ComplianceManagementServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getChecklists() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, title, country_code, category, requirement_details, status, created_at " +
                "FROM compliance_checklist ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createChecklist(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Checklist title is required.");
        }
        String countryCode = body.get("countryCode") != null ? (String) body.get("countryCode") : "GLOBAL";
        String category = body.get("category") != null ? (String) body.get("category") : "LABOR_LAW";
        String details = (String) body.get("requirementDetails");
        String status = body.get("status") != null ? (String) body.get("status") : "COMPLIANT";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO compliance_checklist (id, title, country_code, category, requirement_details, status) VALUES (?, ?, ?, ?, ?, ?)",
                id, title.trim(), countryCode, category, details, status
        );
        log.info("Compliance checklist item created: id={} title={}", id, title);
        return Map.of("id", id, "title", title, "status", status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRiskAssessments() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, topic, impact_level, likelihood_level, mitigation_plan, status, created_at " +
                "FROM compliance_risk_assessment ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createRiskAssessment(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String topic = (String) body.get("topic");
        if (topic == null || topic.isBlank()) {
            throw new IllegalArgumentException("Risk topic is required.");
        }
        String impact = body.get("impactLevel") != null ? (String) body.get("impactLevel") : "MEDIUM";
        String likelihood = body.get("likelihoodLevel") != null ? (String) body.get("likelihoodLevel") : "LOW";
        String plan = (String) body.get("mitigationPlan");
        String status = body.get("status") != null ? (String) body.get("status") : "OPEN";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO compliance_risk_assessment (id, topic, impact_level, likelihood_level, mitigation_plan, status) VALUES (?, ?, ?, ?, ?, ?)",
                id, topic.trim(), impact, likelihood, plan, status
        );
        log.info("Risk assessment created: id={} topic={}", id, topic);
        return Map.of("id", id, "topic", topic, "status", status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPolicyAcknowledgements() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, policy_name, employee_id, policy_version, acknowledged_at FROM policy_acknowledgement ORDER BY acknowledged_at DESC"
        );
    }

    @Override
    public Map<String, Object> acknowledgePolicy(String email, Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String policyName = (String) body.get("policyName");
        if (policyName == null || policyName.isBlank()) {
            throw new IllegalArgumentException("Policy name is required.");
        }
        String version = body.get("policyVersion") != null ? (String) body.get("policyVersion") : "1.0";

        List<String> empIds = jdbc.queryForList("SELECT id FROM employee WHERE email = ?", String.class, email);
        String employeeId = empIds.isEmpty() ? UUID.randomUUID().toString() : empIds.get(0);

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO policy_acknowledgement (id, policy_name, employee_id, policy_version) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
                id, policyName.trim(), employeeId, version
        );
        log.info("Policy acknowledged: policy={} employee={}", policyName, email);
        return Map.of("id", id, "policyName", policyName, "status", "ACKNOWLEDGED");
    }
}
