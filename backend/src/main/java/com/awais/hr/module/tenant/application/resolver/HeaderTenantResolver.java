package com.awais.hr.module.tenant.application.resolver;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Resolves tenant identifier from X-Tenant-ID or X-Tenant HTTP header.
 */
@Component
public class HeaderTenantResolver implements TenantResolver {

    public static final String TENANT_HEADER_1 = "X-Tenant-ID";
    public static final String TENANT_HEADER_2 = "X-Tenant";

    @Override
    public Optional<String> resolveTenantId(HttpServletRequest request) {
        String headerValue = request.getHeader(TENANT_HEADER_1);
        if (headerValue == null || headerValue.isBlank()) {
            headerValue = request.getHeader(TENANT_HEADER_2);
        }
        if (headerValue != null && !headerValue.isBlank()) {
            return Optional.of(headerValue.trim());
        }
        return Optional.empty();
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
