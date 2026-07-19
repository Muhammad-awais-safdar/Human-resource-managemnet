package com.awais.hr.module.attendance.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.attendance.dto.CheckInRequestDTO;
import com.awais.hr.module.attendance.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAttendanceHistory() {
        try {
            List<Map<String, Object>> result = attendanceService.getAttendanceHistory(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/checkin")
    public ApiResponse<Map<String, Object>> checkIn(@RequestBody CheckInRequestDTO dto, HttpServletRequest request) {
        try {
            attendanceService.checkIn(getAuthenticatedUserEmail(), dto, request.getRemoteAddr());
            return ApiResponse.success(Map.of("success", true, "message", "Checked in successfully."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ApiResponse<Map<String, Object>> checkOut() {
        try {
            attendanceService.checkOut(getAuthenticatedUserEmail());
            return ApiResponse.success(Map.of("success", true, "message", "Checked out successfully."));
        } catch (IllegalStateException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Object>> deleteAttendance(@PathVariable String id) {
        try {
            attendanceService.deleteAttendance(id);
            return ApiResponse.success(Map.of("success", true, "message", "Attendance record soft deleted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
