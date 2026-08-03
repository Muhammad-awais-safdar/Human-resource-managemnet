package com.awais.hr.module.tenant.application.resolver;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class TenantResolverChainTest {

    @Test
    @DisplayName("Should resolve tenant ID from header resolver when header present")
    void resolveFromHeaderFirst() {
        HeaderTenantResolver headerResolver = new HeaderTenantResolver();
        SubdomainTenantResolver subdomainResolver = new SubdomainTenantResolver();
        TenantResolverChain chain = new TenantResolverChain(List.of(headerResolver, subdomainResolver));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Tenant-ID", "tenant-acme");
        request.addHeader("Host", "other.localhost:8080");

        Optional<String> resolved = chain.resolveTenantId(request);

        assertTrue(resolved.isPresent());
        assertEquals("tenant-acme", resolved.get());
    }

    @Test
    @DisplayName("Should fallback to subdomain resolver when header is absent")
    void resolveFromSubdomainFallback() {
        HeaderTenantResolver headerResolver = new HeaderTenantResolver();
        SubdomainTenantResolver subdomainResolver = new SubdomainTenantResolver();
        TenantResolverChain chain = new TenantResolverChain(List.of(headerResolver, subdomainResolver));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Host", "stark.localhost:8080");

        Optional<String> resolved = chain.resolveTenantId(request);

        assertTrue(resolved.isPresent());
        assertEquals("stark", resolved.get());
    }
}
