package com.awais.hr.module.workflow.engine;

import com.awais.hr.config.AuthorizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class WorkflowEngineServiceImpl implements WorkflowEngineService {

    private static final Logger log = LoggerFactory.getLogger(WorkflowEngineServiceImpl.class);

    private final DataSource dataSource;
    private final ApproverResolver approverResolver;
    private final AuthorizationService authorizationService;

    public WorkflowEngineServiceImpl(DataSource dataSource, ApproverResolver approverResolver, AuthorizationService authorizationService) {
        this.dataSource = dataSource;
        this.approverResolver = approverResolver;
        this.authorizationService = authorizationService;
    }

    private String getEmployeeIdByEmail(JdbcTemplate jdbc, String email) {
        List<String> list = jdbc.queryForList("SELECT id FROM employee WHERE email = ?", String.class, email);
        if (list.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + email);
        }
        return list.get(0);
    }

    @Override
    public Map<String, Object> startWorkflow(String workflowCode, String resourceType, String resourceId, String initiatorEmail) {
        if (workflowCode == null || resourceType == null || resourceId == null || initiatorEmail == null) {
            throw new IllegalArgumentException("Workflow code, resourceType, resourceId, and initiatorEmail are required.");
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String initiatorEmpId = getEmployeeIdByEmail(jdbc, initiatorEmail);

        // 1. Ensure Workflow Definition exists
        String cleanCode = workflowCode.trim().toUpperCase();
        List<Map<String, Object>> defs = jdbc.queryForList(
                "SELECT id, version FROM workflow_definition WHERE code = ? AND active = TRUE AND deleted = FALSE", cleanCode);

        String defId;
        int versionNum = 1;
        if (defs.isEmpty()) {
            defId = UUID.randomUUID().toString();
            jdbc.update("INSERT INTO workflow_definition (id, code, name, description, module, resource_type, trigger_event, active, version) " +
                            "VALUES (?, ?, ?, ?, 'GENERAL', ?, 'SUBMIT', TRUE, 1)",
                    defId, cleanCode, cleanCode + " Process", "Default enterprise workflow for " + cleanCode, resourceType);
        } else {
            defId = (String) defs.get(0).get("id");
            versionNum = ((Number) defs.get(0).get("version")).intValue();
        }

        // 2. Ensure Workflow Version & Steps exist
        List<String> versions = jdbc.queryForList("SELECT id FROM workflow_version WHERE workflow_definition_id = ? AND version_number = ?",
                String.class, defId, versionNum);
        String versionId;
        if (versions.isEmpty()) {
            versionId = UUID.randomUUID().toString();
            String stepsJson = "[{\"stepOrder\":1, \"name\":\"Manager Approval\", \"approverType\":\"MANAGER\"}, {\"stepOrder\":2, \"name\":\"HR Approval\", \"approverType\":\"HR\"}]";
            jdbc.update("INSERT INTO workflow_version (id, workflow_definition_id, version_number, steps_json, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
                    versionId, defId, versionNum, stepsJson);

            // Create step 1
            jdbc.update("INSERT INTO workflow_step (id, workflow_version_id, step_order, step_name, approver_type, required_permission, access_scope) VALUES (?, ?, 1, 'Manager Approval', 'MANAGER', 'leave:request:approve', 'DEPARTMENT')",
                    UUID.randomUUID().toString(), versionId);
            // Create step 2
            jdbc.update("INSERT INTO workflow_step (id, workflow_version_id, step_order, step_name, approver_type, required_permission, access_scope) VALUES (?, ?, 2, 'HR Approval', 'HR', 'leave:request:approve', 'COMPANY')",
                    UUID.randomUUID().toString(), versionId);
        } else {
            versionId = versions.get(0);
        }

        // 3. Create Workflow Instance idempotently (or retrieve if existing active)
        String instanceId = UUID.randomUUID().toString();
        try {
            jdbc.update("INSERT INTO workflow_instance (id, workflow_definition_id, workflow_version_id, resource_type, resource_id, current_step_order, status, initiated_by) VALUES (?, ?, ?, ?, ?, 1, 'IN_PROGRESS', ?)",
                    instanceId, defId, versionId, resourceType, resourceId, initiatorEmpId);
        } catch (Exception e) {
            log.info("Workflow instance already exists for resource: {}:{}", resourceType, resourceId);
            List<Map<String, Object>> existing = jdbc.queryForList(
                    "SELECT id, status, current_step_order FROM workflow_instance WHERE resource_type = ? AND resource_id = ?",
                    resourceType, resourceId);
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
            throw new IllegalStateException("Failed to instantiate workflow for resource " + resourceId);
        }

        // 4. Resolve approvers for Step 1
        List<Map<String, Object>> step1List = jdbc.queryForList(
                "SELECT id, approver_type, target_approver_id, required_permission FROM workflow_step WHERE workflow_version_id = ? AND step_order = 1",
                versionId);

        String step1Id = step1List.isEmpty() ? UUID.randomUUID().toString() : (String) step1List.get(0).get("id");
        String appType = step1List.isEmpty() ? "MANAGER" : (String) step1List.get(0).get("approver_type");
        String targetAppId = step1List.isEmpty() ? null : (String) step1List.get(0).get("target_approver_id");

        List<String> approverEmpIds = approverResolver.resolveApprovers(appType, targetAppId, initiatorEmpId, initiatorEmpId);
        String assignedEmpId = approverEmpIds.isEmpty() ? null : approverEmpIds.get(0);

        String taskId = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO workflow_task (id, workflow_instance_id, step_id, step_order, assigned_employee_id, assigned_role, status) VALUES (?, ?, ?, 1, ?, ?, 'PENDING')",
                taskId, instanceId, step1Id, assignedEmpId, appType);

        // 5. Record History
        jdbc.update("INSERT INTO workflow_action_history (id, workflow_instance_id, task_id, actor_employee_id, action, previous_state, new_state, comment) VALUES (?, ?, ?, ?, 'SUBMIT', 'DRAFT', 'IN_PROGRESS', 'Workflow initiated')",
                UUID.randomUUID().toString(), instanceId, taskId, initiatorEmpId);

        log.info("Workflow instance started: instanceId={} code={} resource={}:{} by={}", instanceId, cleanCode, resourceType, resourceId, initiatorEmail);

        return Map.of(
                "instanceId", instanceId,
                "workflowCode", cleanCode,
                "status", "IN_PROGRESS",
                "currentStepOrder", 1,
                "assignedApprover", assignedEmpId != null ? assignedEmpId : "UNASSIGNED_ROLE_" + appType
        );
    }

    @Override
    public Map<String, Object> approveTask(String instanceId, String actorEmail, String comment) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actorEmpId = getEmployeeIdByEmail(jdbc, actorEmail);

        Map<String, Object> inst = jdbc.queryForMap(
                "SELECT id, workflow_version_id, current_step_order, status, initiated_by FROM workflow_instance WHERE id = ?", instanceId);

        String currentStatus = (String) inst.get("status");
        if (!"IN_PROGRESS".equals(currentStatus)) {
            throw new IllegalStateException("Cannot approve workflow in state: " + currentStatus);
        }

        String initiatorEmpId = (String) inst.get("initiated_by");
        int currentStepOrder = ((Number) inst.get("current_step_order")).intValue();
        String versionId = (String) inst.get("workflow_version_id");

        // Self-approval protection
        if (actorEmpId.equalsIgnoreCase(initiatorEmpId)) {
            throw new SecurityException("Self-approval prohibited: Requester cannot approve their own workflow request.");
        }

        // Lock & Verify Pending Task
        List<Map<String, Object>> tasks = jdbc.queryForList(
                "SELECT id, step_id, assigned_employee_id, assigned_role FROM workflow_task WHERE workflow_instance_id = ? AND step_order = ? AND status = 'PENDING'",
                instanceId, currentStepOrder);

        if (tasks.isEmpty()) {
            throw new IllegalStateException("No pending task found for workflow step " + currentStepOrder);
        }

        Map<String, Object> task = tasks.get(0);
        String taskId = (String) task.get("id");
        String stepId = (String) task.get("step_id");

        // Authorization validation
        List<Map<String, Object>> stepList = jdbc.queryForList(
                "SELECT required_permission, access_scope FROM workflow_step WHERE id = ?", stepId);
        if (!stepList.isEmpty()) {
            String reqPerm = (String) stepList.get(0).get("required_permission");
            if (reqPerm != null && !reqPerm.isBlank()) {
                authorizationService.checkPermission(actorEmail, reqPerm);
            }
        }

        // Atomic State Transition (Idempotency & Concurrency Guard)
        int updated = jdbc.update("UPDATE workflow_task SET status = 'APPROVED', actioned_by = ?, actioned_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'PENDING'",
                actorEmpId, taskId);

        if (updated == 0) {
            throw new IllegalStateException("Task has already been actioned or concurrent update detected.");
        }

        // Check for Next Step
        List<Map<String, Object>> nextSteps = jdbc.queryForList(
                "SELECT id, step_order, approver_type, target_approver_id, required_permission FROM workflow_step WHERE workflow_version_id = ? AND step_order > ? ORDER BY step_order ASC",
                versionId, currentStepOrder);

        String nextState;
        int nextStepOrder;
        if (nextSteps.isEmpty()) {
            // Workflow complete
            nextState = "APPROVED";
            nextStepOrder = currentStepOrder;
            jdbc.update("UPDATE workflow_instance SET status = 'APPROVED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", instanceId);
        } else {
            // Advance to next step
            Map<String, Object> nextStep = nextSteps.get(0);
            nextStepOrder = ((Number) nextStep.get("step_order")).intValue();
            String nextStepId = (String) nextStep.get("id");
            String appType = (String) nextStep.get("approver_type");
            String targetAppId = (String) nextStep.get("target_approver_id");

            nextState = "IN_PROGRESS";
            jdbc.update("UPDATE workflow_instance SET current_step_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", nextStepOrder, instanceId);

            List<String> nextApprovers = approverResolver.resolveApprovers(appType, targetAppId, initiatorEmpId, initiatorEmpId);
            String nextAssignedId = nextApprovers.isEmpty() ? null : nextApprovers.get(0);

            jdbc.update("INSERT INTO workflow_task (id, workflow_instance_id, step_id, step_order, assigned_employee_id, assigned_role, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
                    UUID.randomUUID().toString(), instanceId, nextStepId, nextStepOrder, nextAssignedId, appType);
        }

        // Audit History Record
        jdbc.update("INSERT INTO workflow_action_history (id, workflow_instance_id, task_id, actor_employee_id, action, previous_state, new_state, comment) VALUES (?, ?, ?, ?, 'APPROVE', 'IN_PROGRESS', ?, ?)",
                UUID.randomUUID().toString(), instanceId, taskId, actorEmpId, nextState, comment);

        log.info("Workflow task approved: instanceId={} step={} actor={} nextState={}", instanceId, currentStepOrder, actorEmail, nextState);

        return Map.of(
                "instanceId", instanceId,
                "action", "APPROVE",
                "status", nextState,
                "currentStepOrder", nextStepOrder,
                "actionedBy", actorEmail
        );
    }

    @Override
    public Map<String, Object> rejectTask(String instanceId, String actorEmail, String comment) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actorEmpId = getEmployeeIdByEmail(jdbc, actorEmail);

        Map<String, Object> inst = jdbc.queryForMap(
                "SELECT id, current_step_order, status, initiated_by FROM workflow_instance WHERE id = ?", instanceId);

        String currentStatus = (String) inst.get("status");
        if (!"IN_PROGRESS".equals(currentStatus)) {
            throw new IllegalStateException("Cannot reject workflow in state: " + currentStatus);
        }

        int currentStepOrder = ((Number) inst.get("current_step_order")).intValue();

        // Lock & Mark task REJECTED
        jdbc.update("UPDATE workflow_task SET status = 'REJECTED', actioned_by = ?, actioned_at = CURRENT_TIMESTAMP WHERE workflow_instance_id = ? AND step_order = ? AND status = 'PENDING'",
                actorEmpId, instanceId, currentStepOrder);

        // Mark Instance REJECTED
        jdbc.update("UPDATE workflow_instance SET status = 'REJECTED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", instanceId);

        // Record History
        jdbc.update("INSERT INTO workflow_action_history (id, workflow_instance_id, actor_employee_id, action, previous_state, new_state, comment) VALUES (?, ?, ?, 'REJECT', 'IN_PROGRESS', 'REJECTED', ?)",
                UUID.randomUUID().toString(), instanceId, actorEmpId, comment);

        log.info("Workflow task rejected: instanceId={} actor={}", instanceId, actorEmail);

        return Map.of("instanceId", instanceId, "status", "REJECTED", "actionedBy", actorEmail);
    }

    @Override
    public Map<String, Object> returnTask(String instanceId, String actorEmail, String comment) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actorEmpId = getEmployeeIdByEmail(jdbc, actorEmail);

        Map<String, Object> inst = jdbc.queryForMap(
                "SELECT id, current_step_order, status FROM workflow_instance WHERE id = ?", instanceId);

        int currentStepOrder = ((Number) inst.get("current_step_order")).intValue();

        jdbc.update("UPDATE workflow_task SET status = 'RETURNED', actioned_by = ?, actioned_at = CURRENT_TIMESTAMP WHERE workflow_instance_id = ? AND step_order = ? AND status = 'PENDING'",
                actorEmpId, instanceId, currentStepOrder);

        jdbc.update("UPDATE workflow_instance SET status = 'RETURNED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", instanceId);

        jdbc.update("INSERT INTO workflow_action_history (id, workflow_instance_id, actor_employee_id, action, previous_state, new_state, comment) VALUES (?, ?, ?, 'RETURN', 'IN_PROGRESS', 'RETURNED', ?)",
                UUID.randomUUID().toString(), instanceId, actorEmpId, comment);

        return Map.of("instanceId", instanceId, "status", "RETURNED", "actionedBy", actorEmail);
    }

    @Override
    public Map<String, Object> cancelWorkflow(String instanceId, String actorEmail, String comment) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actorEmpId = getEmployeeIdByEmail(jdbc, actorEmail);

        Map<String, Object> inst = jdbc.queryForMap(
                "SELECT status, initiated_by FROM workflow_instance WHERE id = ?", instanceId);

        String initiatorId = (String) inst.get("initiated_by");
        boolean isAdmin = authorizationService.hasRole(actorEmail, "TENANT_ADMIN") || authorizationService.hasRole(actorEmail, "SYSTEM_ADMIN");

        if (!actorEmpId.equalsIgnoreCase(initiatorId) && !isAdmin) {
            throw new SecurityException("Only the workflow requester or administrator can cancel this workflow instance.");
        }

        jdbc.update("UPDATE workflow_instance SET status = 'CANCELLED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", instanceId);

        jdbc.update("INSERT INTO workflow_action_history (id, workflow_instance_id, actor_employee_id, action, previous_state, new_state, comment) VALUES (?, ?, ?, 'CANCEL', ?, 'CANCELLED', ?)",
                UUID.randomUUID().toString(), instanceId, actorEmpId, inst.get("status"), comment);

        return Map.of("instanceId", instanceId, "status", "CANCELLED", "actionedBy", actorEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingTasksForUser(String actorEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actorEmpId = getEmployeeIdByEmail(jdbc, actorEmail);
        List<String> actorRoles = authorizationService.getUserRoles(actorEmail);

        String sql = "SELECT t.id as task_id, t.workflow_instance_id, t.step_order, t.status as task_status, " +
                "i.resource_type, i.resource_id, i.status as instance_status, i.initiated_by, i.started_at, " +
                "d.code as workflow_code, d.name as workflow_name " +
                "FROM workflow_task t " +
                "JOIN workflow_instance i ON t.workflow_instance_id = i.id " +
                "JOIN workflow_definition d ON i.workflow_definition_id = d.id " +
                "WHERE t.status = 'PENDING' AND i.status = 'IN_PROGRESS' AND " +
                "(t.assigned_employee_id = ? OR t.assigned_role IN (" + buildInClause(actorRoles) + ")) ORDER BY t.created_at DESC";

        List<Object> params = new ArrayList<>();
        params.add(actorEmpId);
        params.addAll(actorRoles);

        return jdbc.queryForList(sql, params.toArray());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWorkflowHistory(String instanceId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT h.id, h.action, h.previous_state, h.new_state, h.comment, h.actioned_at, " +
                        "e.first_name, e.last_name, e.email " +
                        "FROM workflow_action_history h " +
                        "JOIN employee e ON h.actor_employee_id = e.id " +
                        "WHERE h.workflow_instance_id = ? ORDER BY h.actioned_at ASC",
                instanceId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getWorkflowInstanceStatus(String instanceId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList(
                "SELECT i.id, i.resource_type, i.resource_id, i.current_step_order, i.status, i.started_at, i.completed_at, " +
                        "d.code as workflow_code, d.name as workflow_name " +
                        "FROM workflow_instance i " +
                        "JOIN workflow_definition d ON i.workflow_definition_id = d.id " +
                        "WHERE i.id = ?", instanceId);
        if (list.isEmpty()) {
            throw new IllegalArgumentException("Workflow instance not found: " + instanceId);
        }
        return list.get(0);
    }

    private String buildInClause(List<String> list) {
        if (list.isEmpty()) return "'__NONE__'";
        StringJoiner sj = new StringJoiner(",");
        for (String item : list) {
            sj.add("'" + item.replace("'", "''") + "'");
        }
        return sj.toString();
    }
}
