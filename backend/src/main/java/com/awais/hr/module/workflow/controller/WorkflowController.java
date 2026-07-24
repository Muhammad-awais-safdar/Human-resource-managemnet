package com.awais.hr.module.workflow.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.workflow.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/definitions")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getDefinitions() {
        return ResponseEntity.ok(workflowService.getWorkflowDefinitions());
    }

    @PostMapping("/definitions")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createDefinition(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = workflowService.createWorkflowDefinition(
                    body.get("name"),
                    body.get("description"),
                    body.get("triggerEvent"),
                    body.get("stepsJson")
            );
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/definitions/{id}/trigger")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> triggerWorkflow(@PathVariable String id,
                                               @AuthenticationPrincipal UserDetails user) {
        try {
            workflowService.triggerWorkflow(id, getUsername(user));
            return ResponseEntity.ok(Map.of("success", true, "message", "Workflow triggered successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/executions")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getExecutions(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(workflowService.getExecutions(getUsername(user)));
    }

    @PutMapping("/executions/{id}/advance")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> advanceExecution(@PathVariable String id) {
        workflowService.advanceExecution(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Execution advanced."));
    }

    @PutMapping("/executions/{id}/cancel")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> cancelExecution(@PathVariable String id) {
        workflowService.cancelExecution(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Execution cancelled."));
    }

    private String getUsername(UserDetails user) {
        return user != null ? user.getUsername() : "system@company.com";
    }
}
