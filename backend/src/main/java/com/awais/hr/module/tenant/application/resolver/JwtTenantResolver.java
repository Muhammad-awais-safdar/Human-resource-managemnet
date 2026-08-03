package com.awais.hr.module.tenant.application.resolver;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Stub resolver for tenant ID extraction from JWT claims (To be populated in Sprint 2).
 */
@Component
public class JwtTenantResolver implements TenantResolver {

    @Override
    public Optional<String> resolveTenantId(HttpServletRequest request) {
        // Stub implementation - JWT claims extraction enforced in Auth module
        return Optional.empty();
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 30;
    }
}
