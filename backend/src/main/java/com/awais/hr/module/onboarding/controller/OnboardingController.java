package com.awais.hr.module.onboarding.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.onboarding.dto.PolicySignatureRequestDTO;
import com.awais.hr.module.onboarding.service.OnboardingService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/onboarding")
@CrossOrigin(origins = "*")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/tasks")
    public ApiResponse<List<Map<String, Object>>> getOnboardingTasks() {
        try {
            List<Map<String, Object>> result = onboardingService.getTasks(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/tasks/{id}/complete")
    public ApiResponse<Map<String, Object>> completeTask(@PathVariable String id) {
        try {
            onboardingService.completeTask(id);
            return ApiResponse.success(Map.of("success", true, "message", "Checklist item marked as completed."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/assets")
    public ApiResponse<List<Map<String, Object>>> getAllocatedAssets() {
        try {
            List<Map<String, Object>> result = onboardingService.getAssets(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/signature")
    public ApiResponse<Map<String, Object>> logSignature(@RequestBody PolicySignatureRequestDTO dto) {
        if (dto.getName() == null || dto.getDocument() == null) {
            return ApiResponse.error(400, "Name and document are required.");
        }
        try {
            onboardingService.logSignature(dto);
            return ApiResponse.success(Map.of("success", true, "message", "Digital signature logged successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
