package com.awais.hr.module.employee.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.employee.service.EmployeeInfoService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/employee")
@CrossOrigin(origins = "*")
@Tag(name = "Employee Profile & Self-Service", description = "Endpoints for employee profile management, personal information updates, and self-service queries")
public class EmployeeController {

    private final EmployeeInfoService employeeInfoService;

    public EmployeeController(EmployeeInfoService employeeInfoService) {
        this.employeeInfoService = employeeInfoService;
    }

    @GetMapping("/{id}/info")
    @Operation(summary = "Get Employee Personal Information", description = "Retrieves employee profile details. Pass 'me' as ID to fetch the current authenticated user's profile.")
    public ApiResponse<Map<String, Object>> getEmployeeInfo(@PathVariable String id) {
        String queryId = id;
        if ("me".equalsIgnoreCase(id)) {
            queryId = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        try {
            Map<String, Object> result = employeeInfoService.getEmployeeInfo(queryId);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PutMapping("/{id}/info")
    @Operation(summary = "Update Employee Information", description = "Updates personal profile information for an employee or current user ('me')")
    public ApiResponse<Map<String, Object>> updateEmployeeInfo(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String updateId = id;
        if ("me".equalsIgnoreCase(id)) {
            updateId = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        try {
            employeeInfoService.updateEmployeeInfo(updateId, body);
            return ApiResponse.success(Map.of("success", true, "message", "Employee info updated successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
