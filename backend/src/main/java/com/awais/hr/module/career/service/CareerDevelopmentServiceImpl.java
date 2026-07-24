package com.awais.hr.module.career.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class CareerDevelopmentServiceImpl implements CareerDevelopmentService {

    private static final Logger log = LoggerFactory.getLogger(CareerDevelopmentServiceImpl.class);
    private final DataSource dataSource;

    public CareerDevelopmentServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCareerPaths() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, title, department_id, level_step, required_skills, description, created_at " +
                "FROM career_path ORDER BY level_step ASC"
        );
    }

    @Override
    public Map<String, Object> createCareerPath(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Career path title is required.");
        }
        String deptId = (String) body.get("departmentId");
        Number stepNum = (Number) body.getOrDefault("levelStep", 1);
        int levelStep = stepNum.intValue();
        String skills = (String) body.get("requiredSkills");
        String desc = (String) body.get("description");

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO career_path (id, title, department_id, level_step, required_skills, description) VALUES (?, ?, ?, ?, ?, ?)",
                id, title.trim(), deptId, levelStep, skills, desc
        );
        log.info("Career path created: id={} title={} step={}", id, title, levelStep);
        return Map.of("id", id, "title", title, "levelStep", levelStep);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMentorshipPairs() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, mentor_id, mentee_id, goal_description, start_date, status, created_at " +
                "FROM mentorship_pair ORDER BY start_date DESC"
        );
    }

    @Override
    public Map<String, Object> createMentorshipPair(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String mentorId = (String) body.get("mentorId");
        String menteeId = (String) body.get("menteeId");
        if (mentorId == null || mentorId.isBlank() || menteeId == null || menteeId.isBlank()) {
            throw new IllegalArgumentException("Mentor ID and Mentee ID are required.");
        }
        String goal = (String) body.get("goalDescription");

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO mentorship_pair (id, mentor_id, mentee_id, goal_description) VALUES (?, ?, ?, ?)",
                id, mentorId, menteeId, goal
        );
        log.info("Mentorship pair created: id={} mentor={} mentee={}", id, mentorId, menteeId);
        return Map.of("id", id, "mentorId", mentorId, "menteeId", menteeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDevelopmentPlans() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, employee_id, target_role, skill_gaps, action_plan, status, created_at " +
                "FROM development_plan ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createDevelopmentPlan(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = (String) body.get("employeeId");
        String targetRole = (String) body.get("targetRole");
        if (employeeId == null || employeeId.isBlank() || targetRole == null || targetRole.isBlank()) {
            throw new IllegalArgumentException("Employee ID and Target Role are required.");
        }
        String skillGaps = (String) body.get("skillGaps");
        String actionPlan = (String) body.get("actionPlan");

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO development_plan (id, employee_id, target_role, skill_gaps, action_plan) VALUES (?, ?, ?, ?, ?)",
                id, employeeId, targetRole.trim(), skillGaps, actionPlan
        );
        log.info("Development plan created: id={} employeeId={} role={}", id, employeeId, targetRole);
        return Map.of("id", id, "employeeId", employeeId, "targetRole", targetRole);
    }
}
