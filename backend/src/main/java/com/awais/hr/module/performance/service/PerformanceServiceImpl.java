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
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
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
        String status = dto.getProgress() >= 100 ? "COMPLETED" : "IN_PROGRESS";
        jdbcTemplate.update("UPDATE performance_goal SET current_value = ?, status = ? WHERE id = ?", dto.getProgress(), status, id);
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
        jdbcTemplate.update(
                "INSERT INTO peer_review (id, reviewer_id, reviewee_id, feedback, rating, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
                UUID.randomUUID().toString(), reviewerId, targetEmployeeId, feedback, rating
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

