package com.awais.hr.module.succession.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class SuccessionServiceImpl implements SuccessionService {

    private final DataSource dataSource;

    public SuccessionServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Map<String, Object>> getPositions() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT sp.id, sp.title, sp.is_critical, sp.created_at, " +
            "d.name AS department_name " +
            "FROM succession_position sp " +
            "LEFT JOIN department d ON sp.department_id = d.id " +
            "ORDER BY sp.is_critical DESC, sp.title ASC"
        );
    }

    @Override
    public List<Map<String, Object>> getSuccessionPlans() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT spl.id, spl.readiness_score, spl.timeline_months, spl.status, spl.notes, " +
            "sp.title AS position_title, sp.is_critical, " +
            "e.first_name, e.last_name, e.email " +
            "FROM succession_plan spl " +
            "JOIN succession_position sp ON spl.position_id = sp.id " +
            "JOIN employee e ON spl.successor_id = e.id " +
            "ORDER BY spl.readiness_score DESC"
        );
    }

    @Override
    public void addPosition(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        String title = (String) body.get("title");
        String departmentId = (String) body.getOrDefault("departmentId", null);
        boolean isCritical = Boolean.parseBoolean(String.valueOf(body.getOrDefault("isCritical", false)));
        jdbc.update(
            "INSERT INTO succession_position (id, title, department_id, is_critical) VALUES (?, ?, ?, ?)",
            id, title, departmentId, isCritical
        );
    }

    @Override
    public void addSuccessorToPlan(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        String positionId = (String) body.get("positionId");
        String successorId = (String) body.get("successorId");
        int readinessScore = Integer.parseInt(String.valueOf(body.getOrDefault("readinessScore", 50)));
        int timelineMonths = Integer.parseInt(String.valueOf(body.getOrDefault("timelineMonths", 12)));
        String notes = (String) body.getOrDefault("notes", null);
        jdbc.update(
            "INSERT INTO succession_plan (id, position_id, successor_id, readiness_score, timeline_months, notes) " +
            "VALUES (?, ?, ?, ?, ?, ?)",
            id, positionId, successorId, readinessScore, timelineMonths, notes
        );
    }

    @Override
    public List<Map<String, Object>> getTalentPools() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT tp.id, tp.name, tp.description, tp.created_at, " +
            "COUNT(tpm.id) AS member_count " +
            "FROM talent_pool tp " +
            "LEFT JOIN talent_pool_member tpm ON tp.id = tpm.pool_id " +
            "GROUP BY tp.id, tp.name, tp.description, tp.created_at " +
            "ORDER BY tp.name ASC"
        );
    }

    @Override
    public void addTalentPool(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO talent_pool (id, name, description) VALUES (?, ?, ?)",
            id, body.get("name"), body.getOrDefault("description", null)
        );
    }

    @Override
    public void addMemberToPool(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO talent_pool_member (id, pool_id, employee_id) VALUES (?, ?, ?) " +
            "ON CONFLICT (pool_id, employee_id) DO NOTHING",
            id, body.get("poolId"), body.get("employeeId")
        );
    }
}
