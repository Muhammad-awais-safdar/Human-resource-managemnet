package com.awais.hr.module.learning.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class LearningServiceImpl implements LearningService {

    private final DataSource dataSource;

    public LearningServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    @Override
    public List<Map<String, Object>> getCourses(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        return jdbcTemplate.queryForList(
                "SELECT c.id, c.title, c.description, c.category, ce.status " +
                "FROM course c JOIN course_enrollment ce ON c.id = ce.course_id WHERE ce.employee_id = ?",
                empId
        );
    }

    @Override
    public List<Map<String, Object>> getAllCourses() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList("SELECT id, title, description, category FROM course ORDER BY title");
    }

    @Override
    public void enrollCourse(String email, String courseId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        jdbcTemplate.update(
                "INSERT INTO course_enrollment (id, employee_id, course_id, status, enrolled_at) " +
                "VALUES (?, ?, ?, 'ENROLLED', NOW())",
                UUID.randomUUID().toString(), empId, courseId
        );
    }

    @Override
    public List<Map<String, Object>> getCourseQuizzes(String courseId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, question, option_a, option_b, option_c, option_d FROM quiz WHERE course_id = ?",
                courseId
        );
    }

    @Override
    public Map<String, Object> submitQuizAnswer(String quizId, String answer) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT correct_answer FROM quiz WHERE id = ?", quizId);
        if (rows.isEmpty()) {
            return Map.of("correct", false, "message", "Quiz not found");
        }
        String correct = (String) rows.get(0).get("correct_answer");
        boolean isCorrect = answer != null && answer.equalsIgnoreCase(correct);
        return Map.of("correct", isCorrect, "correctAnswer", correct,
                      "message", isCorrect ? "Correct!" : "Wrong answer");
    }
}

