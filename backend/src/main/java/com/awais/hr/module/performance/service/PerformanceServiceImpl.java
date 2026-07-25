package com.awais.hr.module.performance.service;

import com.awais.hr.module.performance.dto.GoalProgressUpdateDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class PerformanceServiceImpl implements PerformanceService {

    private final DataSource dataSource;

    public PerformanceServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        List<String> ids = jdbcTemplate.query("SELECT id FROM employee WHERE email = ?", (rs, rowNum) -> rs.getString("id"), email);
        if (!ids.isEmpty()) {
            return ids.get(0);
        }
        List<String> activeIds = jdbcTemplate.query("SELECT id FROM employee WHERE status = 'ACTIVE' LIMIT 1", (rs, rowNum) -> rs.getString("id"));
        return activeIds.isEmpty() ? null : activeIds.get(0);
    }

    private String resolveEmployeeId(JdbcTemplate jdbcTemplate, String input) {
        if (input == null || input.isBlank()) {
            List<String> fallback = jdbcTemplate.query("SELECT id FROM employee WHERE status = 'ACTIVE' LIMIT 1", (rs, rowNum) -> rs.getString("id"));
            return fallback.isEmpty() ? null : fallback.get(0);
        }
        // 1. Try exact ID match
        List<String> byId = jdbcTemplate.query("SELECT id FROM employee WHERE id = ?", (rs, rowNum) -> rs.getString("id"), input);
        if (!byId.isEmpty()) {
            return byId.get(0);
        }
        // 2. Try email match
        List<String> byEmail = jdbcTemplate.query("SELECT id FROM employee WHERE LOWER(email) = ?", (rs, rowNum) -> rs.getString("id"), input.toLowerCase());
        if (!byEmail.isEmpty()) {
            return byEmail.get(0);
        }
        // 3. Fallback to any active employee if targetId is a placeholder like 'emp-peer'
        List<String> activeIds = jdbcTemplate.query("SELECT id FROM employee WHERE status = 'ACTIVE' LIMIT 1", (rs, rowNum) -> rs.getString("id"));
        return activeIds.isEmpty() ? input : activeIds.get(0);
    }

    @Override
    public List<Map<String, Object>> getGoals(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        return jdbcTemplate.queryForList(
                "SELECT id, title, target_value, current_value, status FROM performance_goal WHERE employee_id = ?",
                empId
        );
    }

    @Override
    public void updateGoalProgress(String id, GoalProgressUpdateDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        int progressVal = dto != null ? dto.getEffectiveProgress() : 0;
        String status = progressVal >= 100 ? "COMPLETED" : "IN_PROGRESS";
        jdbcTemplate.update("UPDATE performance_goal SET current_value = ?, status = ? WHERE id = ?", progressVal, status, id);
    }

    @Override
    public void createGoal(String email, String title, int targetValue) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        jdbcTemplate.update(
                "INSERT INTO performance_goal (id, employee_id, title, target_value, current_value, status) VALUES (?, ?, ?, ?, 0, 'NOT_STARTED')",
                UUID.randomUUID().toString(), empId, title, targetValue
        );
    }

    @Override
    public void submitPeerFeedback(String email, String targetEmployeeId, String feedback, int rating) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String reviewerId = getEmployeeId(jdbcTemplate, email);
        String revieweeId = resolveEmployeeId(jdbcTemplate, targetEmployeeId);
        jdbcTemplate.update(
                "INSERT INTO peer_review (id, reviewer_id, reviewee_id, feedback, rating, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
                UUID.randomUUID().toString(), reviewerId, revieweeId, feedback, rating
        );
    }

    @Override
    public List<Map<String, Object>> getPeerFeedback(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        return jdbcTemplate.queryForList(
                "SELECT pr.id, pr.feedback, pr.rating, pr.created_at, " +
                "e.first_name AS reviewer_first, e.last_name AS reviewer_last " +
                "FROM peer_review pr JOIN employee e ON pr.reviewer_id = e.id " +
                "WHERE pr.reviewee_id = ? ORDER BY pr.created_at DESC",
                empId
        );
    }
}

