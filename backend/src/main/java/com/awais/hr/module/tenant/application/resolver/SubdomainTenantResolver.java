package com.awais.hr.module.tenant.application.resolver;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Resolves tenant subdomain identifier from the HTTP Host header.
 */
@Component
public class SubdomainTenantResolver implements TenantResolver {

    @Override
    public Optional<String> resolveTenantId(HttpServletRequest request) {
        String host = request.getHeader("Host");
        if (host == null || host.isBlank()) {
            return Optional.empty();
        }

        String domain = host.split(":")[0].trim();
        String[] parts = domain.split("\\.");

        if (parts.length > 1) {
            String subdomain = parts[0];
            if (!subdomain.equalsIgnoreCase("localhost") &&
                !subdomain.equalsIgnoreCase("www") &&
                !subdomain.equalsIgnoreCase("api")) {
                return Optional.of(subdomain);
            }
        }
        return Optional.empty();
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
