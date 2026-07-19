package com.awais.hr.module.payroll.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.payroll.service.PayrollService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/payslips")
    public ApiResponse<List<Map<String, Object>>> getPayslips() {
        try {
            List<Map<String, Object>> result = payrollService.getPayslips(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/run")
    public ApiResponse<Map<String, Object>> runPayroll() {
        try {
            Map<String, Object> result = payrollService.runPayroll(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/all")
    public ApiResponse<List<Map<String, Object>>> getAllPayslips() {
        try {
            return ApiResponse.success(payrollService.getAllPayslips());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}

