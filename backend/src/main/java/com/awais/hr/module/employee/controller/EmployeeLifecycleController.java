package com.awais.hr.module.employee.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.module.employee.dto.ClearanceApprovalRequestDTO;
import com.awais.hr.module.employee.dto.TimelineEventRequestDTO;
import com.awais.hr.module.employee.service.EmployeeLifecycleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.*;


@RestController
@RequestMapping({"/employees", "/employee"})
@CrossOrigin(origins = "*")
@Tag(name = "Employee Directory & Lifecycle", description = "Endpoints for employee catalog, onboarding, department mappings, timeline & offboarding clearances")
public class EmployeeLifecycleController {

    private final EmployeeLifecycleService employeeLifecycleService;

    public EmployeeLifecycleController(EmployeeLifecycleService employeeLifecycleService) {
        this.employeeLifecycleService = employeeLifecycleService;
    }

    @GetMapping({"", "/list"})
    @Operation(summary = "List All Employees", description = "Retrieves complete employee roster for the active tenant, including role & department assignments")
    public ApiResponse<List<Map<String, Object>>> listEmployees() {
        try {
            List<Map<String, Object>> result = employeeLifecycleService.listEmployees();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/timeline")
    @Operation(summary = "Get Employee Timeline Events", description = "Fetches global career timeline events including promotions, transfers, and milestone updates")
    public ApiResponse<List<Map<String, Object>>> getTimeline() {
        try {
            List<Map<String, Object>> result = employeeLifecycleService.getTimeline();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/timeline")
    @Operation(summary = "Add Timeline Milestone Event", description = "Logs a career milestone event (promotion, merit increment, domain transfer) for an employee")
    public ApiResponse<Map<String, Object>> addTimelineEvent(@RequestBody TimelineEventRequestDTO dto) {
        if (dto.getEmployeeId() == null || dto.getType() == null || dto.getEffectiveDate() == null) {
            return ApiResponse.error(400, "Parameters missing.");
        }
        try {
            employeeLifecycleService.addTimelineEvent(dto);
            return ApiResponse.success(Map.of("success", true, "message", "Lifecycle event logged successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/clearance")
    @Operation(summary = "Get Exit Clearance Checklists", description = "Retrieves offboarding exit clearance workflows across HR, IT, and Finance departments")
    public ApiResponse<List<Map<String, Object>>> getExitClearances() {
        try {
            List<Map<String, Object>> result = employeeLifecycleService.getExitClearances();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/clearance")
    @Operation(summary = "Initiate Exit Clearance", description = "Initiates department-wide exit clearance workflow for a departing team member")
    public ApiResponse<Map<String, Object>> initiateClearance(@RequestBody Map<String, String> body) {
        String employeeId = body.get("employeeId");
        if (employeeId == null) {
            return ApiResponse.error(400, "Employee ID is required.");
        }
        try {
            employeeLifecycleService.initiateClearance(employeeId);
            return ApiResponse.success(Map.of("success", true, "message", "Exit clearance workflow initiated."));
        } catch (IllegalStateException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/clearance/approve")
    @Operation(summary = "Approve Department Clearance Step", description = "Approves IT, Finance, or Department clearance item for exit workflow")
    public ApiResponse<Map<String, Object>> approveClearance(@RequestBody ClearanceApprovalRequestDTO dto) {
        if (dto.getClearanceId() == null || dto.getDepartment() == null) {
            return ApiResponse.error(400, "Clearance details missing.");
        }
        try {
            employeeLifecycleService.approveClearance(dto);
            return ApiResponse.success(Map.of("success", true, "message", "Clearance step approved."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/invite")
    @HasPermission("corehr:employee:write")
    @Operation(summary = "Invite New Employee", description = "Issues an onboarding invitation token to a new hire email address")
    public ApiResponse<Map<String, Object>> inviteEmployee(@RequestBody Map<String, String> body) {
        String employeeCode = body.get("employeeCode");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");
        String email = body.get("email");
        String roleId = body.get("roleId");

        if (employeeCode == null || firstName == null || lastName == null || email == null) {
            return ApiResponse.error(400, "Missing required fields.");
        }

        try {
            String token = employeeLifecycleService.inviteEmployee(employeeCode, firstName, lastName, email, roleId);
            return ApiResponse.success(Map.of(
                    "success", true,
                    "token", token,
                    "message", "Employee invited successfully. Share the activation token to complete registration."
            ));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PutMapping("/{id}/role")
    @HasPermission("corehr:employee:write")
    @Operation(summary = "Update Employee Security Role", description = "Assigns RBAC security roles (e.g., HR_MANAGER, FINANCE, REGULAR_EMPLOYEE) to an employee")
    public ApiResponse<Map<String, Object>> updateEmployeeRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        String roleId = body.get("roleId");
        try {
            employeeLifecycleService.updateEmployeeRole(id, roleId);
            return ApiResponse.success(Map.of("success", true, "message", "Employee role updated successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/{id}/360")
    @HasPermission("corehr:employee:read")
    @Operation(summary = "Get Employee 360 View", description = "Retrieves unified 360-degree employee profile: personal info, assets, leaves, payroll history, performance goals, and peer feedback")
    public ApiResponse<Map<String, Object>> getEmployee360(@PathVariable String id) {
        try {
            Map<String, Object> data = employeeLifecycleService.getEmployee360(id);
            return ApiResponse.success(data);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}


