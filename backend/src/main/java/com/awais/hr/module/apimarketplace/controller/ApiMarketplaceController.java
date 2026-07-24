package com.awais.hr.module.apimarketplace.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.apimarketplace.service.ApiMarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/api-marketplace")
public class ApiMarketplaceController {

    private final ApiMarketplaceService apiService;

    public ApiMarketplaceController(ApiMarketplaceService apiService) {
        this.apiService = apiService;
    }

    @GetMapping("/keys")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getApiKeys() {
        return ResponseEntity.ok(apiService.getApiKeys());
    }

    @PostMapping("/keys")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> generateApiKey(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(apiService.generateApiKey(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
