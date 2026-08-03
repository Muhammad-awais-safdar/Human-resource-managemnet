package com.awais.hr.module.tenant.application.resolver;

import com.awais.hr.module.tenant.domain.model.TenantAggregate;
import com.awais.hr.module.tenant.domain.repository.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Resolves tenant identifier from custom registered CNAME domain names in HTTP Host header.
 */
@Component
public class CustomDomainTenantResolver implements TenantResolver {

    private final TenantRepository tenantRepository;

    public CustomDomainTenantResolver(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    public Optional<String> resolveTenantId(HttpServletRequest request) {
        String host = request.getHeader("Host");
        if (host == null || host.isBlank()) {
            return Optional.empty();
        }

        String domain = host.split(":")[0].trim();
        Optional<TenantAggregate> tenantOpt = tenantRepository.findByCustomDomain(domain);
        return tenantOpt.map(t -> t.getId().toString());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 20;
    }
}
