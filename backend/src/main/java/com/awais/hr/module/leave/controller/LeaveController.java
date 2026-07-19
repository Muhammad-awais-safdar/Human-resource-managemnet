package com.awais.hr.module.leave.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.leave.dto.LeaveRequestDTO;
import com.awais.hr.module.leave.dto.LeaveStatusUpdateDTO;
import com.awais.hr.module.leave.service.LeaveService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/policies")
    public ApiResponse<List<Map<String, Object>>> getPolicies() {
        try {
            List<Map<String, Object>> result = leaveService.getPolicies();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/requests")
    public ApiResponse<List<Map<String, Object>>> getRequests() {
        try {
            List<Map<String, Object>> result = leaveService.getRequests(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/requests")
    public ApiResponse<Map<String, Object>> submitRequest(@RequestBody LeaveRequestDTO dto) {
        try {
            leaveService.submitRequest(getAuthenticatedUserEmail(), dto);
            return ApiResponse.success(Map.of("success", true, "message", "Leave request submitted successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PutMapping("/requests/{id}/status")
    public ApiResponse<Map<String, Object>> updateRequestStatus(@PathVariable String id, @RequestBody LeaveStatusUpdateDTO dto) {
        try {
            leaveService.updateRequestStatus(getAuthenticatedUserEmail(), id, dto);
            return ApiResponse.success(Map.of("success", true, "message", "Leave request status updated."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/requests/{id}")
    public ApiResponse<Map<String, Object>> deleteRequest(@PathVariable String id) {
        try {
            leaveService.deleteRequest(id);
            return ApiResponse.success(Map.of("success", true, "message", "Leave request soft deleted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
