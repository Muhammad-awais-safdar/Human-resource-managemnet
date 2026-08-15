package com.awais.hr.module.tenant.infrastructure.filter;

import com.awais.hr.module.tenant.application.resolver.TenantResolverChain;
import com.awais.hr.module.tenant.domain.model.TenantAggregate;
import com.awais.hr.module.tenant.domain.model.TenantContext;
import com.awais.hr.module.tenant.domain.repository.TenantRepository;
import com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Servlet filter establishing tenant context on every HTTP request and guaranteeing clean ThreadLocal release in a finally block.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantContextFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantContextFilter.class);

    private final TenantResolverChain resolverChain;
    private final TenantRepository tenantRepository;

    public TenantContextFilter(TenantResolverChain resolverChain, TenantRepository tenantRepository) {
        this.resolverChain = resolverChain;
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            Optional<String> tenantIdOpt = resolverChain.resolveTenantId(request);

            if (tenantIdOpt.isPresent()) {
                String identifier = tenantIdOpt.get();
                
                // Query master tenant database under MASTER context
                TenantContextHolder.setCurrentTenant("MASTER");
                Optional<TenantAggregate> tenantOpt = Optional.empty();
                try {
                    tenantOpt = tenantRepository.findBySubdomain(identifier);
                    if (tenantOpt.isEmpty()) {
                        try {
                            tenantOpt = tenantRepository.findById(java.util.UUID.fromString(identifier));
                        } catch (IllegalArgumentException ignored) {}
                    }
                } finally {
                    TenantContextHolder.clear();
                }

                if (tenantOpt.isPresent()) {
                    TenantAggregate tenant = tenantOpt.get();
                    TenantContext context = new TenantContext(
                        tenant.getId().toString(),
                        tenant.getSubdomain(),
                        tenant.getStatus(),
                        tenant.getType()
                    );
                    TenantContextHolder.setContext(context);
                    log.debug("Bound tenant context for tenant ID: {}", tenant.getId());
                } else {
                    TenantContextHolder.setCurrentTenant(identifier);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
            log.debug("Cleared tenant context from thread local");
        }
    }
}
