package com.awais.hr.module.workflow.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class WorkflowServiceImpl implements WorkflowService {

    private static final Logger log = LoggerFactory.getLogger(WorkflowServiceImpl.class);
    private final DataSource dataSource;

    public WorkflowServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWorkflowDefinitions() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, name, description, trigger_event, steps_json, active, created_at " +
                "FROM workflow_definition WHERE deleted = FALSE ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> createWorkflowDefinition(String name, String description, String triggerEvent, String stepsJson) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Workflow name is required.");
        }
        if (triggerEvent == null || triggerEvent.isBlank()) {
            throw new IllegalArgumentException("Trigger event is required.");
        }
        if (stepsJson == null || stepsJson.isBlank()) {
            throw new IllegalArgumentException("Steps JSON definition is required.");
        }
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO workflow_definition (id, name, description, trigger_event, steps_json, active) VALUES (?, ?, ?, ?, ?, TRUE)",
                id, name.trim(), description, triggerEvent.trim().toUpperCase(), stepsJson
        );
        log.info("Workflow definition created: id={} name={} trigger={}", id, name, triggerEvent);
        return Map.of("id", id, "name", name, "triggerEvent", triggerEvent);
    }

    @Override
    public void triggerWorkflow(String workflowDefinitionId, String triggeredByEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        // Validate workflow exists and is active
        List<Map<String, Object>> defs = jdbc.queryForList(
                "SELECT id, steps_json FROM workflow_definition WHERE id = ? AND active = TRUE AND deleted = FALSE",
                workflowDefinitionId
        );
        if (defs.isEmpty()) {
            throw new IllegalArgumentException("Workflow definition not found or inactive: " + workflowDefinitionId);
        }
        String triggeredById = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, triggeredByEmail);

        // Escalation at: 24 hours from now by default
        String escalationAt = LocalDateTime.now().plusHours(24)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String execId = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO workflow_execution (id, workflow_id, triggered_by, current_step_index, status, escalation_at) VALUES (?, ?, ?, 0, 'IN_PROGRESS', ?)",
                execId, workflowDefinitionId, triggeredById, escalationAt
        );
        log.info("Workflow triggered: execId={} workflowId={} by={}", execId, workflowDefinitionId, triggeredByEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExecutions(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        boolean isAdmin = Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND (r.name = 'SUPER_ADMIN' OR r.name = 'ADMIN'))",
                Boolean.class, empId
        ));
        if (isAdmin) {
            return jdbc.queryForList(
                    "SELECT we.id, we.status, we.current_step_index, we.escalation_at, we.created_at, " +
                    "wd.name as workflow_name, wd.trigger_event, wd.steps_json " +
                    "FROM workflow_execution we JOIN workflow_definition wd ON we.workflow_id = wd.id " +
                    "WHERE we.deleted = FALSE ORDER BY we.created_at DESC"
            );
        }
        return jdbc.queryForList(
                "SELECT we.id, we.status, we.current_step_index, we.escalation_at, we.created_at, " +
                "wd.name as workflow_name, wd.trigger_event " +
                "FROM workflow_execution we JOIN workflow_definition wd ON we.workflow_id = wd.id " +
                "WHERE we.triggered_by = ? AND we.deleted = FALSE ORDER BY we.created_at DESC",
                empId
        );
    }

    @Override
    public void advanceExecution(String executionId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Map<String, Object> exec = jdbc.queryForMap(
                "SELECT we.id, we.current_step_index, we.workflow_id, wd.steps_json " +
                "FROM workflow_execution we JOIN workflow_definition wd ON we.workflow_id = wd.id " +
                "WHERE we.id = ? AND we.deleted = FALSE",
                executionId
        );
        int currentStep = ((Number) exec.get("current_step_index")).intValue();
        String stepsJson = (String) exec.get("steps_json");
        // Count steps by counting commas in array + 1 (simplified, full JSON parse omitted for zero-dependency)
        int stepCount = stepsJson.split("\\{").length - 1;
        int nextStep = currentStep + 1;
        if (nextStep >= stepCount) {
            jdbc.update("UPDATE workflow_execution SET status = 'COMPLETED', completed_at = NOW(), current_step_index = ? WHERE id = ?",
                    nextStep, executionId);
            log.info("Workflow execution completed: id={}", executionId);
        } else {
            jdbc.update("UPDATE workflow_execution SET current_step_index = ? WHERE id = ?", nextStep, executionId);
            log.info("Workflow advanced: id={} step={}", executionId, nextStep);
        }
    }

    @Override
    public void cancelExecution(String executionId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("UPDATE workflow_execution SET status = 'CANCELLED' WHERE id = ?", executionId);
        log.info("Workflow execution cancelled: id={}", executionId);
    }

    @Override
    @Scheduled(fixedDelay = 300_000) // Every 5 minutes
    public void checkAndEscalateOverdue() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<String> overdueIds = jdbc.queryForList(
                "SELECT id FROM workflow_execution WHERE status = 'IN_PROGRESS' AND escalation_at < NOW() AND deleted = FALSE",
                String.class
        );
        for (String id : overdueIds) {
            jdbc.update("UPDATE workflow_execution SET status = 'ESCALATED' WHERE id = ?", id);
            log.warn("Workflow execution ESCALATED due to overdue SLA: id={}", id);
        }
        if (!overdueIds.isEmpty()) {
            log.info("Escalated {} overdue workflow executions.", overdueIds.size());
        }
    }
}
