package com.awais.hr.module.benefits.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.benefits.service.BenefitsService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/benefits")
@CrossOrigin(origins = "*")
public class BenefitsController {

    private final BenefitsService benefitsService;

    public BenefitsController(BenefitsService benefitsService) {
        this.benefitsService = benefitsService;
    }

    private String getEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/plans")
    public ApiResponse<List<Map<String, Object>>> getPlans() {
        try {
            return ApiResponse.success(benefitsService.getPlans());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/plans")
    public ApiResponse<String> addPlan(@RequestBody Map<String, Object> body) {
        try {
            benefitsService.addPlan(body);
            return ApiResponse.success("Benefit plan created.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/my-enrollments")
    public ApiResponse<List<Map<String, Object>>> getMyEnrollments() {
        try {
            return ApiResponse.success(benefitsService.getMyEnrollments(getEmail()));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/enrollments")
    public ApiResponse<List<Map<String, Object>>> getAllEnrollments() {
        try {
            return ApiResponse.success(benefitsService.getAllEnrollments());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/enroll/{planId}")
    public ApiResponse<String> enroll(@PathVariable String planId) {
        try {
            benefitsService.enroll(getEmail(), planId);
            return ApiResponse.success("Successfully enrolled in benefit plan.");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/unenroll/{planId}")
    public ApiResponse<String> unenroll(@PathVariable String planId) {
        try {
            benefitsService.unenroll(getEmail(), planId);
            return ApiResponse.success("Unenrolled from benefit plan.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
