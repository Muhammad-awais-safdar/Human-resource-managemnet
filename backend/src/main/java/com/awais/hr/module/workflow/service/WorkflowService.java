package com.awais.hr.module.workflow.service;

import java.util.List;
import java.util.Map;

public interface WorkflowService {
    List<Map<String, Object>> getWorkflowDefinitions();
    Map<String, Object> createWorkflowDefinition(String name, String description, String triggerEvent, String stepsJson);
    void triggerWorkflow(String workflowDefinitionId, String triggeredByEmail);
    List<Map<String, Object>> getExecutions(String email);
    void advanceExecution(String executionId);
    void cancelExecution(String executionId);
    void checkAndEscalateOverdue();
}
