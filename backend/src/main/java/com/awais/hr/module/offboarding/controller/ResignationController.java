package com.awais.hr.module.offboarding.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.offboarding.dto.ResignationRequestDTO;
import com.awais.hr.module.offboarding.service.ResignationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/offboarding")
@CrossOrigin(origins = "*")
public class ResignationController {

    private final ResignationService resignationService;

    public ResignationController(ResignationService resignationService) {
        this.resignationService = resignationService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/resignations")
    public ApiResponse<List<Map<String, Object>>> getResignations() {
        try {
            List<Map<String, Object>> result = resignationService.getResignations(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/resignations")
    public ApiResponse<Map<String, Object>> submitResignation(@RequestBody ResignationRequestDTO dto) {
        try {
            resignationService.submitResignation(getAuthenticatedUserEmail(), dto);
            return ApiResponse.success(Map.of("success", true, "message", "Resignation request submitted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/resignations/{id}")
    public ApiResponse<Map<String, Object>> deleteResignation(@PathVariable String id) {
        try {
            resignationService.deleteResignation(id);
            return ApiResponse.success(Map.of("success", true, "message", "Resignation record soft deleted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/resignations/{id}/settle")
    public ApiResponse<Map<String, Object>> settleResignation(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "") String exitFeedback,
            @RequestParam(required = false, defaultValue = "0.0") double settlementAmount) {
        try {
            resignationService.settleResignation(id, exitFeedback, settlementAmount);
            return ApiResponse.success(Map.of("success", true, "message", "Resignation finalized and payroll settlement calculated."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
