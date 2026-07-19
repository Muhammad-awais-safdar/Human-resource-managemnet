package com.awais.hr.module.approvals.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.approvals.service.ApprovalService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/approvals")
@CrossOrigin(origins = "*")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping("/pending")
    @HasPermission("corehr:employee:read")
    public ApiResponse<List<Map<String, Object>>> getPendingApprovals() {
        try {
            List<Map<String, Object>> pending = approvalService.getPendingApprovals();
            return ApiResponse.success(pending);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{type}/{id}/action")
    @HasPermission("corehr:employee:write")
    public ApiResponse<Map<String, Object>> actionApproval(
            @PathVariable String type,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String action = body.get("action");
        String comment = body.get("comment");
        if (action == null || action.trim().isEmpty()) {
            return ApiResponse.error(400, "Action (APPROVE/REJECT) is required.");
        }
        try {
            approvalService.actionApproval(type, id, action, comment);
            return ApiResponse.success(Map.of("success", true, "message", "Approval step processed successfully."));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
