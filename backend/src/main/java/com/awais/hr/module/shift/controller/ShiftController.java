package com.awais.hr.module.shift.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.shift.service.ShiftService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/shifts")
@CrossOrigin(origins = "*")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping("/schedule")
    public ApiResponse<List<Map<String, Object>>> getShifts() {
        try {
            List<Map<String, Object>> result = shiftService.getShifts();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/assign")
    public ApiResponse<Map<String, Object>> assignShift(
            @RequestParam String employeeId,
            @RequestParam String shiftId,
            @RequestParam String date) {
        try {
            shiftService.assignShift(employeeId, shiftId, date);
            return ApiResponse.success(Map.of("success", true, "message", "Shift successfully assigned."));
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/swap")
    public ApiResponse<Map<String, Object>> swapShift(
            @RequestParam String firstEmployeeId,
            @RequestParam String secondEmployeeId,
            @RequestParam String date) {
        try {
            shiftService.swapShift(firstEmployeeId, secondEmployeeId, date);
            return ApiResponse.success(Map.of("success", true, "message", "Shifts successfully swapped."));
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
