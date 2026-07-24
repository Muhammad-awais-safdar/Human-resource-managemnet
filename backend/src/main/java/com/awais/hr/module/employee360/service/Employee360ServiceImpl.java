package com.awais.hr.module.employee360.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class Employee360ServiceImpl implements Employee360Service {

    private static final Logger log = LoggerFactory.getLogger(Employee360ServiceImpl.class);
    private final DataSource dataSource;

    public Employee360ServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> get360Profile(String employeeId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> notes = jdbc.queryForList("SELECT id, author_email, note_content, is_private, created_at FROM employee_manager_note WHERE employee_id = ? ORDER BY created_at DESC", employeeId);
        List<Map<String, Object>> skills = jdbc.queryForList("SELECT id, skill_name, proficiency, updated_at FROM employee_skill_matrix WHERE employee_id = ?", employeeId);

        if (skills.isEmpty()) {
            skills = List.of(
                    Map.of("skillName", "Java / Spring Boot", "proficiency", "EXPERT"),
                    Map.of("skillName", "React / Next.js", "proficiency", "ADVANCED")
            );
        }

        return Map.of(
                "employeeId", employeeId,
                "notes", notes,
                "skills", skills,
                "careerTimeline", List.of(
                        Map.of("title", "Senior Software Engineer", "date", "2024-01-15"),
                        Map.of("title", "Lead Systems Architect", "date", "2026-03-01")
                ),
                "compensationHistory", List.of(
                        Map.of("effectiveDate", "2024-01-15", "salary", 85000),
                        Map.of("effectiveDate", "2026-01-01", "salary", 110000)
                )
        );
    }

    @Override
    public Map<String, Object> addManagerNote(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = (String) body.get("employeeId");
        String content = (String) body.get("noteContent");
        if (empId == null || empId.isBlank() || content == null || content.isBlank()) {
            throw new IllegalArgumentException("Employee ID and note content are required.");
        }
        String author = body.get("authorEmail") != null ? (String) body.get("authorEmail") : "manager@workforceos.com";
        Boolean isPriv = body.get("isPrivate") != null ? (Boolean) body.get("isPrivate") : true;

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO employee_manager_note (id, employee_id, author_email, note_content, is_private) VALUES (?, ?, ?, ?, ?)", id, empId, author, content.trim(), isPriv);
        log.info("Manager private note added for employee {}: noteId={}", empId, id);
        return Map.of("id", id, "employeeId", empId, "authorEmail", author, "noteContent", content, "isPrivate", isPriv);
    }
}
