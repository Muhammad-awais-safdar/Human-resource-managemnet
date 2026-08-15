package com.awais.hr.context;

import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.repository.TenantRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Optional;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantResolutionFilter implements Filter {

    private final TenantRepository tenantRepository;

    public TenantResolutionFilter(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String tenantHeader = httpRequest.getHeader("X-Tenant");
        String resolvedTenantId = null;

        // Query master tenant database under MASTER context
        TenantContextHolder.setCurrentTenant("MASTER");
        try {
            if (tenantHeader != null && !tenantHeader.trim().isEmpty()) {
                String tenantKey = tenantHeader.trim();
                Optional<Tenant> tenantOpt = tenantRepository.findBySubdomain(tenantKey);
                if (tenantOpt.isPresent()) {
                    resolvedTenantId = tenantOpt.get().getId();
                } else {
                    resolvedTenantId = tenantKey;
                }
            } else {
                // Fallback: Resolve from Host header (e.g. acme.localhost:8080 or custom-domain.com)
                String host = httpRequest.getHeader("Host");
                if (host != null) {
                    // Strip port number if present
                    String domain = host.split(":")[0].trim();
                    
                    // 1. Check if host matches a registered custom CNAME domain
                    Optional<Tenant> customDomainTenant = tenantRepository.findByCustomDomain(domain);
                    if (customDomainTenant.isPresent()) {
                        resolvedTenantId = customDomainTenant.get().getId();
                    } else {
                        // 2. Check if host has a subdomain prefix (e.g., acme.localhost)
                        String[] parts = domain.split("\\.");
                        if (parts.length > 1) {
                            String subdomain = parts[0];
                            if (!subdomain.equalsIgnoreCase("localhost") && !subdomain.equalsIgnoreCase("www")) {
                                Optional<Tenant> subdomainTenant = tenantRepository.findBySubdomain(subdomain);
                                if (subdomainTenant.isPresent()) {
                                    resolvedTenantId = subdomainTenant.get().getId();
                                } else {
                                    resolvedTenantId = subdomain;
                                }
                            }
                        }
                    }
                }
            }
        } finally {
            TenantContextHolder.clear();
        }

        if (resolvedTenantId != null) {
            TenantContextHolder.setCurrentTenant(resolvedTenantId);
        }

        try {
            chain.doFilter(request, response);
        } finally {
            // Clean ThreadLocal context to prevent memory leaks and connection leakage
            TenantContextHolder.clear();
        }
    }
}
