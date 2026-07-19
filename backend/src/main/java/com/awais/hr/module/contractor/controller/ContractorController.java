package com.awais.hr.module.contractor.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.contractor.service.ContractorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contractor")
@CrossOrigin(origins = "*")
public class ContractorController {

    private final ContractorService contractorService;

    public ContractorController(ContractorService contractorService) {
        this.contractorService = contractorService;
    }

    @GetMapping("/contractors")
    public ApiResponse<List<Map<String, Object>>> getContractors() {
        try {
            return ApiResponse.success(contractorService.getContractors());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/contractors")
    public ApiResponse<String> addContractor(@RequestBody Map<String, Object> body) {
        try {
            contractorService.addContractor(body);
            return ApiResponse.success("Contractor added successfully.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/contractors/{id}/agreements")
    public ApiResponse<List<Map<String, Object>>> getAgreements(@PathVariable String id) {
        try {
            return ApiResponse.success(contractorService.getAgreements(id));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/agreements")
    public ApiResponse<String> addAgreement(@RequestBody Map<String, Object> body) {
        try {
            contractorService.addAgreement(body);
            return ApiResponse.success("Agreement added successfully.");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/contractors/{id}/timesheets")
    public ApiResponse<List<Map<String, Object>>> getTimesheets(@PathVariable String id) {
        try {
            return ApiResponse.success(contractorService.getTimesheets(id));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/timesheets")
    public ApiResponse<String> submitTimesheet(@RequestBody Map<String, Object> body) {
        try {
            contractorService.submitTimesheet(body);
            return ApiResponse.success("Timesheet submitted successfully.");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/timesheets/{id}/action")
    public ApiResponse<String> actionTimesheet(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            String status = (String) body.get("status");
            contractorService.actionTimesheet(id, status);
            return ApiResponse.success("Timesheet status updated to " + status + ".");
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
