package com.awais.hr.module.project.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.project.dto.TimesheetLogRequestDTO;
import com.awais.hr.module.project.service.ProjectService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/projects")
    public ApiResponse<List<Map<String, Object>>> getProjects() {
        try {
            List<Map<String, Object>> result = projectService.getProjects();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/projects/timesheets")
    public ApiResponse<Map<String, Object>> submitTimesheet(@RequestBody TimesheetLogRequestDTO dto) {
        try {
            projectService.submitTimesheet(getAuthenticatedUserEmail(), dto);
            return ApiResponse.success(Map.of("success", true, "message", "Timesheet hours logged."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/projects/allocations")
    public ApiResponse<Map<String, Object>> allocateResource(@RequestBody Map<String, String> body) {
        try {
            String projectId = body.get("projectId");
            String employeeId = body.get("employeeId");
            String role = body.get("role");
            projectService.allocateResource(projectId, employeeId, role);
            return ApiResponse.success(Map.of("success", true, "message", "Resource allocated to project successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/projects/timesheets")
    public ApiResponse<List<Map<String, Object>>> getTimesheets() {
        try {
            List<Map<String, Object>> result = projectService.getTimesheets(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/projects/timesheets/{id}/approve")
    public ApiResponse<Map<String, Object>> approveTimesheet(@PathVariable String id) {
        try {
            projectService.approveTimesheet(id, getAuthenticatedUserEmail());
            return ApiResponse.success(Map.of("success", true, "message", "Timesheet approved successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/projects/timesheets/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectTimesheet(@PathVariable String id) {
        try {
            projectService.rejectTimesheet(id, getAuthenticatedUserEmail());
            return ApiResponse.success(Map.of("success", true, "message", "Timesheet rejected successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
