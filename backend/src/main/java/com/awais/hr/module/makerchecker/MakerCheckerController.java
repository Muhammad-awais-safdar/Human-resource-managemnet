package com.awais.hr.module.makerchecker;

import com.awais.hr.common.ApiResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/maker-checker")
@CrossOrigin(origins = "*")
public class MakerCheckerController {

    private final MakerCheckerService makerCheckerService;

    public MakerCheckerController(MakerCheckerService makerCheckerService) {
        this.makerCheckerService = makerCheckerService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @PostMapping("/requests")
    public ApiResponse<Map<String, Object>> createRequest(@RequestBody Map<String, String> payload) {
        try {
            String requestType = payload.get("requestType");
            String entityId = payload.get("entityId");
            String changePayload = payload.get("changePayload");
            Map<String, Object> result = makerCheckerService.createRequest(
                    requestType, entityId, changePayload, getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/requests/{id}/approve")
    public ApiResponse<Map<String, Object>> approveRequest(@PathVariable("id") String id) {
        try {
            Map<String, Object> result = makerCheckerService.approveRequest(id, getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (SecurityException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/requests/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectRequest(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String reason = payload != null ? payload.get("reason") : "Rejected";
            Map<String, Object> result = makerCheckerService.rejectRequest(id, getAuthenticatedUserEmail(), reason);
            return ApiResponse.success(result);
        } catch (SecurityException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ApiResponse<List<Map<String, Object>>> getPendingRequests() {
        try {
            List<Map<String, Object>> list = makerCheckerService.getPendingRequests(getAuthenticatedUserEmail());
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/my-requests")
    public ApiResponse<List<Map<String, Object>>> getMyRequests() {
        try {
            List<Map<String, Object>> list = makerCheckerService.getMySubmittedRequests(getAuthenticatedUserEmail());
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/requests/{id}")
    public ApiResponse<Map<String, Object>> getRequestById(@PathVariable("id") String id) {
        try {
            Map<String, Object> result = makerCheckerService.getRequestById(id);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }
}
