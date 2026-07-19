package com.awais.hr.module.workforce.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.workforce.service.WorkforceSchedulingService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workforce")
@CrossOrigin(origins = "*")
public class WorkforceSchedulingController {

    private final WorkforceSchedulingService schedulingService;

    public WorkforceSchedulingController(WorkforceSchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    private String getEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/schedules")
    public ApiResponse<List<Map<String, Object>>> getSchedules() {
        try {
            return ApiResponse.success(schedulingService.getSchedules(getEmail()));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/schedules")
    public ApiResponse<String> createSchedule(@RequestBody Map<String, Object> body) {
        try {
            schedulingService.createSchedule(body);
            return ApiResponse.success("Schedule created successfully.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/open-shifts")
    public ApiResponse<List<Map<String, Object>>> getOpenShifts() {
        try {
            return ApiResponse.success(schedulingService.getOpenShifts());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/open-shifts")
    public ApiResponse<String> createOpenShift(@RequestBody Map<String, Object> body) {
        try {
            schedulingService.createOpenShift(body);
            return ApiResponse.success("Open shift created successfully.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/open-shifts/{id}/bid")
    public ApiResponse<String> bidOnShift(@PathVariable String id) {
        try {
            schedulingService.bidOnShift(getEmail(), id);
            return ApiResponse.success("Bid submitted successfully.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/bids/{id}/action")
    public ApiResponse<String> actionBid(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            String status = (String) body.get("status");
            schedulingService.actionBid(id, status);
            return ApiResponse.success("Bid " + status + ".");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
