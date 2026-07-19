package com.awais.hr.module.travel.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.travel.service.TravelRequestService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/travel")
@CrossOrigin(origins = "*")
public class TravelRequestController {

    private final TravelRequestService travelRequestService;

    public TravelRequestController(TravelRequestService travelRequestService) {
        this.travelRequestService = travelRequestService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/requests")
    public ApiResponse<List<Map<String, Object>>> getTravelRequests() {
        try {
            List<Map<String, Object>> result = travelRequestService.getTravelRequests(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/requests")
    public ApiResponse<Map<String, Object>> submitTravelRequest(@RequestBody Map<String, String> body) {
        try {
            String destination = body.get("destination");
            String purpose = body.get("purpose");
            String startDate = body.get("startDate");
            String endDate = body.get("endDate");
            travelRequestService.submitTravelRequest(getAuthenticatedUserEmail(), destination, purpose, startDate, endDate);
            return ApiResponse.success(Map.of("success", true, "message", "Travel request submitted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/requests/{id}/approve")
    public ApiResponse<Map<String, Object>> approveTravelRequest(@PathVariable String id) {
        try {
            travelRequestService.approveTravelRequest(id, getAuthenticatedUserEmail());
            return ApiResponse.success(Map.of("success", true, "message", "Travel request approved."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/requests/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectTravelRequest(@PathVariable String id) {
        try {
            travelRequestService.rejectTravelRequest(id, getAuthenticatedUserEmail());
            return ApiResponse.success(Map.of("success", true, "message", "Travel request rejected."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
