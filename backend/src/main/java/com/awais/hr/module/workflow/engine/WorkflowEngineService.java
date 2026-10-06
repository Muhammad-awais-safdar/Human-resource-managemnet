package com.awais.hr.module.workflow.engine;

import java.util.List;
import java.util.Map;

public interface WorkflowEngineService {

    /**
     * Initiate a new workflow instance for a given resource.
     */
    Map<String, Object> startWorkflow(String workflowCode, String resourceType, String resourceId, String initiatorEmail);

    /**
     * Approve the active pending task for the workflow instance.
     */
    Map<String, Object> approveTask(String instanceId, String actorEmail, String comment);

    /**
     * Reject the active pending task for the workflow instance.
     */
    Map<String, Object> rejectTask(String instanceId, String actorEmail, String comment);

    /**
     * Return the active pending task for correction back to the previous step/initiator.
     */
    Map<String, Object> returnTask(String instanceId, String actorEmail, String comment);

    /**
     * Cancel an active workflow instance.
     */
    Map<String, Object> cancelWorkflow(String instanceId, String actorEmail, String comment);

    /**
     * Retrieve all pending workflow approval tasks assigned to or actionable by the given user.
     */
    List<Map<String, Object>> getPendingTasksForUser(String actorEmail);

    /**
     * Retrieve complete action audit trail for a workflow instance.
     */
    List<Map<String, Object>> getWorkflowHistory(String instanceId);

    /**
     * Get current status details of a workflow instance.
     */
    Map<String, Object> getWorkflowInstanceStatus(String instanceId);
}
