package com.awais.hr.module.tenant.controller;

import com.awais.hr.module.tenant.dto.TenantRegisterRequestDTO;
import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.service.TenantService;
import jakarta.servlet.http.HttpServletRequest;
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
            @Valid @RequestBody TenantRegisterRequestDTO request,
            HttpServletRequest httpRequest) {
        
        log.info("Received request to onboard tenant subdomain: {}", request.getSubdomain());

        // Domain Protection: Reject tenant registration if request originates on a tenant subdomain
        String tenantHeader = httpRequest.getHeader("X-Tenant");
        String host = httpRequest.getHeader("Host");
        boolean isSubdomainRequest = false;

        if (tenantHeader != null && !tenantHeader.isBlank() 
            && !tenantHeader.equalsIgnoreCase("main") 
            && !tenantHeader.equalsIgnoreCase("localhost") 
            && !tenantHeader.equalsIgnoreCase("www")
            && !tenantHeader.equalsIgnoreCase("app")) {
            isSubdomainRequest = true;
        } else if (host != null) {
            String domain = host.split(":")[0].trim();
            String[] parts = domain.split("\\.");
            if (parts.length > 1) {
                String sub = parts[0];
                if (!sub.equalsIgnoreCase("localhost") && !sub.equalsIgnoreCase("www") && !sub.equalsIgnoreCase("app")) {
                    isSubdomainRequest = true;
                }
            }
        }

        if (isSubdomainRequest) {
            log.warn("Blocked registration attempt on tenant subdomain context: {}", tenantHeader != null ? tenantHeader : host);
            Map<String, Object> errResponse = new HashMap<>();
            errResponse.put("success", false);
            errResponse.put("message", "Tenant workspace registration is restricted to the main platform domain. Registration on tenant subdomains is disabled.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errResponse);
        }
        
        // Register the new tenant company, database, dynamic pools, branding, and schema migrations
        Tenant tenant = tenantService.registerNewTenant(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tenant registration initiated and provisioned successfully");
        response.put("tenantId", tenant.getId());
        response.put("subdomain", tenant.getSubdomain());
        response.put("adminEmail", request.getAdminEmail());
        
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
}
