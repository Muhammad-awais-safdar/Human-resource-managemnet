package com.awais.hr.module.tenant.application.resolver;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Fallback resolver executing at lowest priority to ensure multi-tenant requests
 * default to the primary tenant workspace ('awais') when host or custom headers are omitted.
 */
@Component
public class DefaultFallbackTenantResolver implements TenantResolver {

    public static final String DEFAULT_TENANT = "awais";

    @Override
    public Optional<String> resolveTenantId(HttpServletRequest request) {
        return Optional.of(DEFAULT_TENANT);
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
