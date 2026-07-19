package com.awais.hr.module.document.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.document.dto.DocumentUploadRequestDTO;
import com.awais.hr.module.document.service.DocumentService;
import com.awais.hr.service.FileStorageService;
import com.awais.hr.context.TenantContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;
import java.util.*;

@RestController
@RequestMapping("/suite/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;
    private final FileStorageService fileStorageService;
    private final DataSource dataSource;

    public DocumentController(DocumentService documentService, FileStorageService fileStorageService, DataSource dataSource) {
        this.documentService = documentService;
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

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getDocuments() {
        try {
            List<Map<String, Object>> result = documentService.getDocuments(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "expiryDate", required = false) String expiryDate) {
        try {
            String email = getAuthenticatedUserEmail();
            String empId = getEmployeeId(email);
            String tenantId = TenantContextHolder.getCurrentTenant();

            // Store physical file inside directory uploads/tenant_[id]/employee_[id]/documents/...
            String storedPath = fileStorageService.storeFile(tenantId, empId, "documents", file);

            DocumentUploadRequestDTO dto = new DocumentUploadRequestDTO();
            dto.setName(file.getOriginalFilename());
            dto.setUrl(storedPath);
            dto.setExpiryDate(expiryDate);

            documentService.uploadDocument(email, dto);
            return ApiResponse.success(Map.of("success", true, "message", "Document file uploaded and registered successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{id}/sign")
    public ApiResponse<Map<String, Object>> signDocument(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String signatureData = body.get("signatureData");
            documentService.signDocument(id, signatureData);
            return ApiResponse.success(Map.of("success", true, "message", "Document signed successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/expired")
    public ApiResponse<List<Map<String, Object>>> getExpiredDocuments() {
        try {
            List<Map<String, Object>> result = documentService.getExpiredDocuments();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
