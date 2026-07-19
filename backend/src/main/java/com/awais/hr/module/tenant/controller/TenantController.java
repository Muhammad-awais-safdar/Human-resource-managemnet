package com.awais.hr.module.tenant.controller;

import com.awais.hr.module.tenant.dto.TenantRegisterRequestDTO;
import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
@Slf4j
public class TenantController {

    private final TenantService tenantService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerTenant(
            @Valid @RequestBody TenantRegisterRequestDTO request) {
        log.info("Received request to onboard tenant subdomain: {}", request.getSubdomain());
        
        // Register the new tenant company, database, dynamic pools, and schema migrations
        Tenant tenant = tenantService.registerNewTenant(
                request.getCompanyName(),
                request.getSubdomain(),
                request.getAdminEmail()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tenant registration initiated and provisioned successfully");
        response.put("tenantId", tenant.getId());
        response.put("subdomain", tenant.getSubdomain());
        
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
}
