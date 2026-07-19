package com.awais.hr.module.holiday.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.holiday.service.HolidayService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/holidays")
@CrossOrigin(origins = "*")
public class HolidayController {

    private final HolidayService holidayService;

    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getHolidays() {
        try {
            return ApiResponse.success(holidayService.getHolidays());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> addHoliday(@RequestBody Map<String, String> body) {
        try {
            holidayService.addHoliday(body.get("name"), body.get("holidayDate"), body.get("description"));
            return ApiResponse.success(Map.of("success", true, "message", "Holiday added successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/regional")
    public ApiResponse<List<Map<String, Object>>> getRegionalHolidays(@RequestParam String region) {
        try {
            return ApiResponse.success(holidayService.getRegionalHolidays(region));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}

