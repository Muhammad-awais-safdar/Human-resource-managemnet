package com.awais.hr.module.workflow.engine;

import com.awais.hr.common.ApiResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/workflow")
@CrossOrigin(origins = "*")
public class WorkflowEngineController {

    private final WorkflowEngineService workflowEngineService;

    public WorkflowEngineController(WorkflowEngineService workflowEngineService) {
        this.workflowEngineService = workflowEngineService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @PostMapping("/start")
    public ApiResponse<Map<String, Object>> startWorkflow(@RequestBody Map<String, String> payload) {
        try {
            String workflowCode = payload.get("workflowCode");
            String resourceType = payload.get("resourceType");
            String resourceId = payload.get("resourceId");
            Map<String, Object> result = workflowEngineService.startWorkflow(
                    workflowCode, resourceType, resourceId, getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/instances/{id}/approve")
    public ApiResponse<Map<String, Object>> approveTask(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String comment = payload != null ? payload.get("comment") : "Approved";
            Map<String, Object> result = workflowEngineService.approveTask(id, getAuthenticatedUserEmail(), comment);
            return ApiResponse.success(result);
        } catch (SecurityException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/instances/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectTask(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String comment = payload != null ? payload.get("comment") : "Rejected";
            Map<String, Object> result = workflowEngineService.rejectTask(id, getAuthenticatedUserEmail(), comment);
            return ApiResponse.success(result);
        } catch (SecurityException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/instances/{id}/return")
    public ApiResponse<Map<String, Object>> returnTask(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String comment = payload != null ? payload.get("comment") : "Returned for revision";
            Map<String, Object> result = workflowEngineService.returnTask(id, getAuthenticatedUserEmail(), comment);
            return ApiResponse.success(result);
        } catch (SecurityException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/instances/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancelWorkflow(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String comment = payload != null ? payload.get("comment") : "Cancelled by user";
            Map<String, Object> result = workflowEngineService.cancelWorkflow(id, getAuthenticatedUserEmail(), comment);
            return ApiResponse.success(result);
        } catch (SecurityException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/pending-tasks")
    public ApiResponse<List<Map<String, Object>>> getPendingTasks() {
        try {
            List<Map<String, Object>> tasks = workflowEngineService.getPendingTasksForUser(getAuthenticatedUserEmail());
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/instances/{id}/history")
    public ApiResponse<List<Map<String, Object>>> getWorkflowHistory(@PathVariable("id") String id) {
        try {
            List<Map<String, Object>> history = workflowEngineService.getWorkflowHistory(id);
            return ApiResponse.success(history);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/instances/{id}/status")
    public ApiResponse<Map<String, Object>> getWorkflowStatus(@PathVariable("id") String id) {
        try {
            Map<String, Object> status = workflowEngineService.getWorkflowInstanceStatus(id);
            return ApiResponse.success(status);
        } catch (Exception e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }
}
