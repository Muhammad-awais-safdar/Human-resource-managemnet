package com.awais.hr.module.expense.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.expense.dto.ExpenseClaimRequestDTO;
import com.awais.hr.module.expense.service.ExpenseService;
import com.awais.hr.service.FileStorageService;
import com.awais.hr.context.TenantContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;
import java.util.*;

@RestController
@RequestMapping("/suite/expense")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final FileStorageService fileStorageService;
    private final DataSource dataSource;

    public ExpenseController(ExpenseService expenseService, FileStorageService fileStorageService, DataSource dataSource) {
        this.expenseService = expenseService;
        this.fileStorageService = fileStorageService;
        this.dataSource = dataSource;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    private String getEmployeeId(String email) {
        return new JdbcTemplate(dataSource).queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    @GetMapping("/claims")
    public ApiResponse<List<Map<String, Object>>> getExpenses() {
        try {
            List<Map<String, Object>> result = expenseService.getExpenses(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/claims")
    public ApiResponse<Map<String, Object>> submitExpense(@RequestBody ExpenseClaimRequestDTO dto) {
        try {
            expenseService.submitExpense(getAuthenticatedUserEmail(), dto);
            return ApiResponse.success(Map.of("success", true, "message", "Expense claim filed."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/claims/{id}")
    public ApiResponse<Map<String, Object>> deleteExpense(@PathVariable String id) {
        try {
            expenseService.deleteExpense(id);
            return ApiResponse.success(Map.of("success", true, "message", "Expense claim soft deleted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/claims/{id}/receipt")
    public ApiResponse<Map<String, Object>> uploadReceipt(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String email = getAuthenticatedUserEmail();
            String empId = getEmployeeId(email);
            String tenantId = TenantContextHolder.getCurrentTenant();
            
            // Store physical file inside directory uploads/tenant_[id]/employee_[id]/receipts/...
            String storedPath = fileStorageService.storeFile(tenantId, empId, "receipts", file);
            
            expenseService.uploadReceipt(id, storedPath);
            return ApiResponse.success(Map.of("success", true, "message", "Receipt file uploaded and attached successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/claims/{id}/approve")
    public ApiResponse<Map<String, Object>> approveExpense(@PathVariable String id) {
        try {
            expenseService.approveExpense(id, getAuthenticatedUserEmail());
            return ApiResponse.success(Map.of("success", true, "message", "Expense claim approved successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/claims/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectExpense(@PathVariable String id) {
        try {
            expenseService.rejectExpense(id, getAuthenticatedUserEmail());
            return ApiResponse.success(Map.of("success", true, "message", "Expense claim rejected successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
