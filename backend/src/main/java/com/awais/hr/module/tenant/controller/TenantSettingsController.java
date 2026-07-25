package com.awais.hr.module.tenant.controller;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/tenants/active")
@CrossOrigin(origins = "*")
public class TenantSettingsController {

    private final TenantRepository tenantRepository;

    public TenantSettingsController(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @GetMapping
    public ResponseEntity<?> getActiveTenantBranding() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "No active tenant workspace resolved."));
        }

        if ("MASTER".equalsIgnoreCase(tenantId) || "SYSTEM".equalsIgnoreCase(tenantId)) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "tenantId", "MASTER",
                    "name", "Platform Administration Console",
                    "subdomain", "master",
                    "customDomain", "",
                    "logoUrl", "",
                    "primaryColor", "#6366f1",
                    "secondaryColor", "#a855f7"
            ));
        }

        Optional<Tenant> tenantOpt;
        TenantContextHolder.clear();
        try {
            tenantOpt = tenantRepository.findById(tenantId);
        } finally {
            TenantContextHolder.setCurrentTenant(tenantId);
        }

        if (tenantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Tenant not found."));
        }

        Tenant tenant = tenantOpt.get();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "tenantId", tenant.getId(),
                "name", tenant.getName(),
                "subdomain", tenant.getSubdomain(),
                "customDomain", tenant.getCustomDomain() != null ? tenant.getCustomDomain() : "",
                "logoUrl", tenant.getLogoUrl() != null ? tenant.getLogoUrl() : "",
                "primaryColor", tenant.getPrimaryColor() != null ? tenant.getPrimaryColor() : "#6366f1",
                "secondaryColor", tenant.getSecondaryColor() != null ? tenant.getSecondaryColor() : "#a855f7"
        ));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateTenantSettings(@RequestBody Map<String, String> settings) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                     .body(Map.of("success", false, "message", "No active tenant workspace resolved."));
        }

        Optional<Tenant> tenantOpt;
        TenantContextHolder.clear();
        try {
            tenantOpt = tenantRepository.findById(tenantId);
        } finally {
            TenantContextHolder.setCurrentTenant(tenantId);
        }

        if (tenantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Tenant not found."));
        }

        Tenant tenant = tenantOpt.get();
        
        if (settings.containsKey("customDomain")) {
            String domain = settings.get("customDomain");
            if (domain != null && !domain.trim().isEmpty()) {
                Optional<Tenant> existingDomainTenant;
                TenantContextHolder.clear();
                try {
                    existingDomainTenant = tenantRepository.findByCustomDomain(domain.trim());
                } finally {
                    TenantContextHolder.setCurrentTenant(tenantId);
                }

                if (existingDomainTenant.isPresent() && !existingDomainTenant.get().getId().equals(tenantId)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("success", false, "message", "Custom domain '" + domain + "' is already registered by another tenant"));
                }
                tenant.setCustomDomain(domain.trim());
            } else {
                tenant.setCustomDomain(null);
            }
        }

        if (settings.containsKey("logoUrl")) {
            tenant.setLogoUrl(settings.get("logoUrl"));
        }

        if (settings.containsKey("primaryColor")) {
            tenant.setPrimaryColor(settings.get("primaryColor"));
        }

        if (settings.containsKey("secondaryColor")) {
            tenant.setSecondaryColor(settings.get("secondaryColor"));
        }

        TenantContextHolder.clear();
        try {
            tenantRepository.save(tenant);
        } finally {
            TenantContextHolder.setCurrentTenant(tenantId);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Workspace branding settings updated successfully",
                "settings", Map.of(
                        "customDomain", tenant.getCustomDomain() != null ? tenant.getCustomDomain() : "",
                        "logoUrl", tenant.getLogoUrl() != null ? tenant.getLogoUrl() : "",
                        "primaryColor", tenant.getPrimaryColor(),
                        "secondaryColor", tenant.getSecondaryColor()
                )
        ));
    }
}
