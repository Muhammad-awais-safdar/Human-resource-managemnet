package com.awais.hr.module.tenant.application.resolver;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Composite chain of resolvers executing tenant resolution strategies in prioritized order.
 */
@Component
public class TenantResolverChain {

    private final List<TenantResolver> resolvers;

    public TenantResolverChain(List<TenantResolver> resolvers) {
        this.resolvers = resolvers.stream()
                .sorted(Comparator.comparingInt(TenantResolver::getOrder))
                .toList();
    }

    public Optional<String> resolveTenantId(HttpServletRequest request) {
        for (TenantResolver resolver : resolvers) {
            Optional<String> tenantId = resolver.resolveTenantId(request);
            if (tenantId.isPresent()) {
                return tenantId;
            }
        }
        return Optional.empty();
    }
}
