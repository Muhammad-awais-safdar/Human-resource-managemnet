package com.awais.hr.module.project.service;

import com.awais.hr.module.project.dto.TaskRequestDTO;
import java.util.List;
import java.util.Map;

public interface TaskService {
    List<Map<String, Object>> getTasks(String userEmail);
    void createTask(String creatorEmail, TaskRequestDTO dto);
    void transitionTaskStatus(String taskId, String newStatus, String comment, String userEmail);
    void reassignTask(String taskId, String newAssigneeId, String userEmail);
    List<Map<String, Object>> getTaskHistory(String taskId);
}
