package com.awais.hr.module.project.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.project.dto.TaskRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskServiceImpl.class);

    private static final Set<String> VALID_TASK_STATES = Set.of(
            "BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "COMPLETED", "CANCELLED"
    );

    private final DataSource dataSource;

    public TaskServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    private boolean isManagerOrAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        Boolean result = jdbcTemplate.queryForObject(
                "SELECT EXISTS(" +
                        "  SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id " +
                        "  WHERE er.employee_id = ? AND r.name IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'SYSTEM_ADMIN', 'LINE_MANAGER', 'PROJECT_MANAGER') " +
                        ")",
                Boolean.class, employeeId
        );
        return Boolean.TRUE.equals(result);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTasks(String userEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbc, userEmail);

        if (isManagerOrAdmin(jdbc, empId)) {
            return jdbc.queryForList(
                    "SELECT t.id, t.project_id, t.title, t.description, t.assignee_id, t.creator_id, t.priority, t.status, t.due_date, t.created_at, " +
                            "ea.first_name as assignee_first_name, ea.last_name as assignee_last_name, " +
                            "ec.first_name as creator_first_name, ec.last_name as creator_last_name " +
                            "FROM project_task t " +
                            "JOIN employee ea ON t.assignee_id = ea.id " +
                            "JOIN employee ec ON t.creator_id = ec.id " +
                            "ORDER BY t.created_at DESC"
            );
        } else {
            return jdbc.queryForList(
                    "SELECT t.id, t.project_id, t.title, t.description, t.assignee_id, t.creator_id, t.priority, t.status, t.due_date, t.created_at, " +
                            "ea.first_name as assignee_first_name, ea.last_name as assignee_last_name " +
                            "FROM project_task t " +
                            "JOIN employee ea ON t.assignee_id = ea.id " +
                            "WHERE t.assignee_id = ? OR t.creator_id = ? " +
                            "ORDER BY t.created_at DESC",
                    empId, empId
            );
        }
    }

    @Override
    @Auditable(action = "TASK_CREATE", entity = "Task")
    public void createTask(String creatorEmail, TaskRequestDTO dto) {
        if (dto == null || dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task title is required.");
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String creatorId = getEmployeeId(jdbc, creatorEmail);

        String assigneeId = dto.getAssigneeId();
        if (assigneeId == null || assigneeId.isBlank()) {
            assigneeId = creatorId;
        }

        String priority = dto.getPriority() != null ? dto.getPriority().toUpperCase() : "MEDIUM";
        String taskId = UUID.randomUUID().toString();
        String initialStatus = "TODO";

        jdbc.update(
                "INSERT INTO project_task (id, project_id, title, description, assignee_id, creator_id, priority, status, due_date) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DATE))",
                taskId, dto.getProjectId(), dto.getTitle(), dto.getDescription(), assigneeId, creatorId, priority, initialStatus, dto.getDueDate()
        );

        jdbc.update(
                "INSERT INTO task_status_history (id, task_id, previous_status, new_status, actor_email, comment) " +
                        "VALUES (?, ?, 'NONE', 'TODO', ?, 'Task created and assigned')",
                UUID.randomUUID().toString(), taskId, creatorEmail
        );

        log.info("Task created: taskId={} title={} assigneeId={} creator={}", taskId, dto.getTitle(), assigneeId, creatorEmail);
    }

    @Override
    @Auditable(action = "TASK_TRANSITION", entity = "Task")
    public void transitionTaskStatus(String taskId, String newStatus, String comment, String userEmail) {
        String targetStatus = newStatus != null ? newStatus.toUpperCase().trim() : "";
        if (!VALID_TASK_STATES.contains(targetStatus)) {
            throw new IllegalArgumentException("Invalid target task status: " + newStatus);
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actorId = getEmployeeId(jdbc, userEmail);

        Map<String, Object> task = jdbc.queryForMap(
                "SELECT assignee_id, creator_id, status FROM project_task WHERE id = ?", taskId
        );

        String currentStatus = (String) task.get("status");
        String assigneeId = (String) task.get("assignee_id");
        String creatorId = (String) task.get("creator_id");

        // Authorization check: Only assignee, creator, or manager/admin can transition task status
        boolean isAuthorized = actorId.equals(assigneeId) || actorId.equals(creatorId) || isManagerOrAdmin(jdbc, actorId);
        if (!isAuthorized) {
            throw new SecurityException("Forbidden: You are not authorized to update this task's status.");
        }

        jdbc.update("UPDATE project_task SET status = ? WHERE id = ?", targetStatus, taskId);

        jdbc.update(
                "INSERT INTO task_status_history (id, task_id, previous_status, new_status, actor_email, comment) " +
                        "VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), taskId, currentStatus, targetStatus, userEmail, comment != null ? comment : "Status updated to " + targetStatus
        );

        log.info("Task status transitioned: taskId={} from={} to={} actor={}", taskId, currentStatus, targetStatus, userEmail);
    }

    @Override
    @Auditable(action = "TASK_REASSIGN", entity = "Task")
    public void reassignTask(String taskId, String newAssigneeId, String userEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String actorId = getEmployeeId(jdbc, userEmail);

        Map<String, Object> task = jdbc.queryForMap("SELECT assignee_id, creator_id FROM project_task WHERE id = ?", taskId);
        String creatorId = (String) task.get("creator_id");

        if (!actorId.equals(creatorId) && !isManagerOrAdmin(jdbc, actorId)) {
            throw new SecurityException("Forbidden: Only task creator or manager can reassign tasks.");
        }

        jdbc.update("UPDATE project_task SET assignee_id = ? WHERE id = ?", newAssigneeId, taskId);

        jdbc.update(
                "INSERT INTO task_status_history (id, task_id, previous_status, new_status, actor_email, comment) " +
                        "VALUES (?, ?, 'REASSIGNED', 'REASSIGNED', ?, ?)",
                UUID.randomUUID().toString(), taskId, userEmail, "Task reassigned to " + newAssigneeId
        );

        log.info("Task reassigned: taskId={} newAssignee={} by={}", taskId, newAssigneeId, userEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTaskHistory(String taskId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, previous_status, new_status, actor_email, comment, created_at " +
                        "FROM task_status_history WHERE task_id = ? ORDER BY created_at ASC",
                taskId
        );
    }
}
