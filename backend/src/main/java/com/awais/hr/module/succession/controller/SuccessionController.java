package com.awais.hr.module.succession.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.succession.service.SuccessionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/succession")
@CrossOrigin(origins = "*")
public class SuccessionController {

    private final SuccessionService successionService;

    public SuccessionController(SuccessionService successionService) {
        this.successionService = successionService;
    }

    @GetMapping("/positions")
    public ApiResponse<List<Map<String, Object>>> getPositions() {
        try {
            return ApiResponse.success(successionService.getPositions());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/positions")
    public ApiResponse<String> addPosition(@RequestBody Map<String, Object> body) {
        try {
            successionService.addPosition(body);
            return ApiResponse.success("Position added successfully.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/plans")
    public ApiResponse<List<Map<String, Object>>> getSuccessionPlans() {
        try {
            return ApiResponse.success(successionService.getSuccessionPlans());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/plans")
    public ApiResponse<String> addSuccessorToPlan(@RequestBody Map<String, Object> body) {
        try {
            successionService.addSuccessorToPlan(body);
            return ApiResponse.success("Successor added to plan.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/talent-pools")
    public ApiResponse<List<Map<String, Object>>> getTalentPools() {
        try {
            return ApiResponse.success(successionService.getTalentPools());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/talent-pools")
    public ApiResponse<String> addTalentPool(@RequestBody Map<String, Object> body) {
        try {
            successionService.addTalentPool(body);
            return ApiResponse.success("Talent pool created.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/talent-pools/members")
    public ApiResponse<String> addMemberToPool(@RequestBody Map<String, Object> body) {
        try {
            successionService.addMemberToPool(body);
            return ApiResponse.success("Member added to talent pool.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
