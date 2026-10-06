package com.awais.hr.module.performance.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.performance.dto.GoalProgressUpdateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class PerformanceServiceImpl implements PerformanceService {

    private static final Logger log = LoggerFactory.getLogger(PerformanceServiceImpl.class);
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
        List<String> byId = jdbcTemplate.query("SELECT id FROM employee WHERE id = ?", (rs, rowNum) -> rs.getString("id"), input);
        if (!byId.isEmpty()) {
            return byId.get(0);
        }
        List<String> byEmail = jdbcTemplate.query("SELECT id FROM employee WHERE LOWER(email) = ?", (rs, rowNum) -> rs.getString("id"), input.toLowerCase());
        if (!byEmail.isEmpty()) {
            return byEmail.get(0);
        }
        List<String> activeIds = jdbcTemplate.query("SELECT id FROM employee WHERE status = 'ACTIVE' LIMIT 1", (rs, rowNum) -> rs.getString("id"));
        return activeIds.isEmpty() ? input : activeIds.get(0);
    }

    @Override
    @Transactional(readOnly = true)
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
    @Auditable(action = "GOAL_CREATE", entity = "PerformanceGoal")
    public void createGoal(String email, String title, int targetValue) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        jdbcTemplate.update(
                "INSERT INTO performance_goal (id, employee_id, title, target_value, current_value, status) VALUES (?, ?, ?, ?, 0, 'NOT_STARTED')",
                UUID.randomUUID().toString(), empId, title, targetValue
        );
    }

    @Override
    @Auditable(action = "PEER_FEEDBACK_SUBMIT", entity = "PeerReview")
    public void submitPeerFeedback(String email, String targetEmployeeId, String feedback, int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Feedback rating must be between 1 and 5.");
        }
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String reviewerId = getEmployeeId(jdbcTemplate, email);
        String revieweeId = resolveEmployeeId(jdbcTemplate, targetEmployeeId);

        if (reviewerId != null && reviewerId.equals(revieweeId)) {
            throw new IllegalArgumentException("Self-Feedback Guard: You cannot submit peer feedback for yourself.");
        }

        jdbcTemplate.update(
                "INSERT INTO peer_review (id, reviewer_id, reviewee_id, feedback, rating, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
                UUID.randomUUID().toString(), reviewerId, revieweeId, feedback, rating
        );
    }

    @Override
    @Transactional(readOnly = true)
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

    @Override
    @Auditable(action = "APPRAISAL_CYCLE_START", entity = "PerformanceCycle")
    public Map<String, Object> startReviewCycle(String title, String period, String startDate, String endDate, String hrEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String hrId = getEmployeeId(jdbc, hrEmail);
        String cycleId = UUID.randomUUID().toString();

        jdbc.update(
                "INSERT INTO performance_review_cycle (id, title, review_period, status, start_date, end_date) " +
                        "VALUES (?, ?, ?, 'IN_PROGRESS', CAST(? AS DATE), CAST(? AS DATE))",
                cycleId, title, period, startDate, endDate
        );

        List<Map<String, Object>> employees = jdbc.queryForList("SELECT id FROM employee WHERE status NOT IN ('TERMINATED', 'RESIGNED')");
        for (Map<String, Object> emp : employees) {
            String empId = (String) emp.get("id");
            jdbc.update(
                    "INSERT INTO employee_appraisal_360 (id, cycle_id, employee_id, evaluator_id, status) VALUES (?, ?, ?, ?, 'SELF_APPRAISAL')",
                    UUID.randomUUID().toString(), cycleId, empId, hrId
            );
        }

        log.info("Performance 360 review cycle started: cycleId={} period={} totalEmployees={}", cycleId, period, employees.size());

        return Map.of("cycleId", cycleId, "title", title, "period", period, "status", "IN_PROGRESS", "employeeCount", employees.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAppraisals(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbc, email);

        return jdbc.queryForList(
                "SELECT a.id, a.cycle_id, a.self_rating, a.self_summary, a.manager_rating, a.manager_summary, a.calibrated_rating, a.status, " +
                        "c.title as cycle_title, c.review_period, " +
                        "e.first_name, e.last_name, e.email " +
                        "FROM employee_appraisal_360 a " +
                        "JOIN performance_review_cycle c ON a.cycle_id = c.id " +
                        "JOIN employee e ON a.employee_id = e.id " +
                        "WHERE a.employee_id = ? OR a.evaluator_id = ? " +
                        "ORDER BY a.created_at DESC",
                empId, empId
        );
    }

    @Override
    @Auditable(action = "APPRAISAL_SELF_SUBMIT", entity = "PerformanceAppraisal")
    public void submitSelfAppraisal(String appraisalId, int rating, String summary, String userEmail) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Self-appraisal rating must be between 1 and 5.");
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbc, userEmail);

        Map<String, Object> appraisal = jdbc.queryForMap("SELECT employee_id, status FROM employee_appraisal_360 WHERE id = ?", appraisalId);
        String applicantId = (String) appraisal.get("employee_id");

        if (empId != null && !empId.equals(applicantId)) {
            throw new SecurityException("Forbidden: You can only submit a self-appraisal for yourself.");
        }

        jdbc.update(
                "UPDATE employee_appraisal_360 SET self_rating = ?, self_summary = ?, status = 'PEER_REVIEW' WHERE id = ?",
                rating, summary, appraisalId
        );

        jdbc.update(
                "INSERT INTO appraisal_cycle_log (id, appraisal_id, previous_status, new_status, actor_email, comment) " +
                        "VALUES (?, ?, 'SELF_APPRAISAL', 'PEER_REVIEW', ?, 'Self-appraisal completed')",
                UUID.randomUUID().toString(), appraisalId, userEmail
        );
    }

    @Override
    @Auditable(action = "APPRAISAL_MANAGER_SUBMIT", entity = "PerformanceAppraisal")
    public void submitManagerEvaluation(String appraisalId, int rating, String summary, String managerEmail) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Manager evaluation rating must be between 1 and 5.");
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String managerId = getEmployeeId(jdbc, managerEmail);

        Map<String, Object> appraisal = jdbc.queryForMap("SELECT employee_id, status FROM employee_appraisal_360 WHERE id = ?", appraisalId);
        String applicantId = (String) appraisal.get("employee_id");

        // Evaluator cannot be employee themselves
        if (managerId != null && managerId.equals(applicantId)) {
            throw new IllegalArgumentException("Self-Evaluation Guard: You cannot evaluate yourself as a Line Manager.");
        }

        jdbc.update(
                "UPDATE employee_appraisal_360 SET manager_rating = ?, manager_summary = ?, status = 'CALIBRATION' WHERE id = ?",
                rating, summary, appraisalId
        );

        jdbc.update(
                "INSERT INTO appraisal_cycle_log (id, appraisal_id, previous_status, new_status, actor_email, comment) " +
                        "VALUES (?, ?, 'PEER_REVIEW', 'CALIBRATION', ?, 'Manager evaluation completed')",
                UUID.randomUUID().toString(), appraisalId, managerEmail
        );
    }

    @Override
    @Auditable(action = "APPRAISAL_CALIBRATE", entity = "PerformanceAppraisal")
    public void calibrateAppraisal(String appraisalId, int calibratedRating, String hrEmail) {
        if (calibratedRating < 1 || calibratedRating > 5) {
            throw new IllegalArgumentException("Calibrated rating must be between 1 and 5.");
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        jdbc.update(
                "UPDATE employee_appraisal_360 SET calibrated_rating = ?, status = 'FINALIZED' WHERE id = ?",
                calibratedRating, appraisalId
        );

        jdbc.update(
                "INSERT INTO appraisal_cycle_log (id, appraisal_id, previous_status, new_status, actor_email, comment) " +
                        "VALUES (?, ?, 'CALIBRATION', 'FINALIZED', ?, 'Final HR calibration score recorded')",
                UUID.randomUUID().toString(), appraisalId, hrEmail
        );
    }

    @Override
    @Auditable(action = "APPRAISAL_ACKNOWLEDGE", entity = "PerformanceAppraisal")
    public void acknowledgeAppraisal(String appraisalId, String employeeEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        jdbc.update("UPDATE employee_appraisal_360 SET status = 'ACKNOWLEDGED' WHERE id = ?", appraisalId);

        jdbc.update(
                "INSERT INTO appraisal_cycle_log (id, appraisal_id, previous_status, new_status, actor_email, comment) " +
                        "VALUES (?, ?, 'FINALIZED', 'ACKNOWLEDGED', ?, 'Employee acknowledged performance appraisal')",
                UUID.randomUUID().toString(), appraisalId, employeeEmail
        );
    }
}
