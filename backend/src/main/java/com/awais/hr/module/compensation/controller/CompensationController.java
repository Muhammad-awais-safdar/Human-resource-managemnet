package com.awais.hr.module.compensation.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.compensation.service.CompensationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/compensation")
@CrossOrigin(origins = "*")
public class CompensationController {

    private final CompensationService compensationService;

    public CompensationController(CompensationService compensationService) {
        this.compensationService = compensationService;
    }

    private String getEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/bands")
    public ApiResponse<List<Map<String, Object>>> getBands() {
        try {
            return ApiResponse.success(compensationService.getBands());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/bands")
    public ApiResponse<String> addBand(@RequestBody Map<String, Object> body) {
        try {
            compensationService.addBand(body);
            return ApiResponse.success("Compensation band saved.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/reviews")
    public ApiResponse<List<Map<String, Object>>> getSalaryReviews() {
        try {
            return ApiResponse.success(compensationService.getSalaryReviews());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/reviews")
    public ApiResponse<String> submitReview(@RequestBody Map<String, Object> body) {
        try {
            compensationService.submitReview(getEmail(), body);
            return ApiResponse.success("Salary review submitted successfully.");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/reviews/{id}/action")
    public ApiResponse<String> actionReview(@PathVariable String id,
                                             @RequestBody Map<String, Object> body) {
        try {
            String status = (String) body.get("status");
            compensationService.actionReview(getEmail(), id, status);
            return ApiResponse.success("Review " + status + ".");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
