package com.awais.hr.module.performance.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.performance.dto.GoalProgressUpdateDTO;
import com.awais.hr.module.performance.service.PerformanceService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/performance")
@CrossOrigin(origins = "*")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/goals")
    public ApiResponse<List<Map<String, Object>>> getGoals() {
        try {
            List<Map<String, Object>> result = performanceService.getGoals(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PutMapping("/goals/{id}")
    public ApiResponse<Map<String, Object>> updateGoalProgress(@PathVariable String id, @RequestBody GoalProgressUpdateDTO dto) {
        try {
            performanceService.updateGoalProgress(id, dto);
            return ApiResponse.success(Map.of("success", true, "message", "Goal progression logged."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/goals")
    public ApiResponse<Map<String, Object>> createGoal(@RequestBody Map<String, Object> body) {
        try {
            String email = getAuthenticatedUserEmail();
            String title = (String) body.get("title");
            int targetValue = ((Number) body.get("targetValue")).intValue();
            performanceService.createGoal(email, title, targetValue);
            return ApiResponse.success(Map.of("success", true, "message", "Goal created."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/peer-feedback")
    public ApiResponse<Map<String, Object>> submitPeerFeedback(@RequestBody Map<String, Object> body) {
        try {
            String email = getAuthenticatedUserEmail();
            performanceService.submitPeerFeedback(
                    email,
                    (String) body.get("targetEmployeeId"),
                    (String) body.get("feedback"),
                    ((Number) body.get("rating")).intValue()
            );
            return ApiResponse.success(Map.of("success", true, "message", "Peer feedback submitted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/peer-feedback")
    public ApiResponse<List<Map<String, Object>>> getPeerFeedback() {
        try {
            return ApiResponse.success(performanceService.getPeerFeedback(getAuthenticatedUserEmail()));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}

