package com.awais.hr.module.tenant.infrastructure.filter;

import com.awais.hr.module.tenant.application.resolver.HeaderTenantResolver;
import com.awais.hr.module.tenant.application.resolver.TenantResolverChain;
import com.awais.hr.module.tenant.domain.repository.TenantRepository;
import com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class TenantContextFilterTest {

    @Test
    @DisplayName("Should bind tenant context during request and guarantee clean ThreadLocal release in finally block")
    void testFilterLifecycleAndThreadLocalCleanup() throws ServletException, IOException {
        TenantRepository tenantRepository = Mockito.mock(TenantRepository.class);
        when(tenantRepository.findBySubdomain(anyString())).thenReturn(Optional.empty());

        HeaderTenantResolver headerResolver = new HeaderTenantResolver();
        TenantResolverChain chain = new TenantResolverChain(List.of(headerResolver));
        TenantContextFilter filter = new TenantContextFilter(chain, tenantRepository);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Tenant-ID", "test-tenant-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain filterChain = (req, res) -> {
            // Verify context is bound during filter execution
            assertEquals("test-tenant-123", TenantContextHolder.getCurrentTenant());
        };

        filter.doFilter(request, response, filterChain);

        // Verify ThreadLocal context is completely cleared after request execution
        assertNull(TenantContextHolder.getCurrentTenant());
        assertNull(TenantContextHolder.getContext());
    }
}
