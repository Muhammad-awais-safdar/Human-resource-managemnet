package com.awais.hr.module.tenant.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Externalized configuration properties for multi-tenant isolation engine.
 */
@Configuration
@ConfigurationProperties(prefix = "app.tenant")
public class TenantProperties {

    private String defaultTenantId = "master";
    private boolean headerResolverEnabled = true;
    private boolean subdomainResolverEnabled = true;
    private boolean customDomainResolverEnabled = true;
    private String baseDomain = "localhost";

    public String getDefaultTenantId() {
        return defaultTenantId;
    }

    public void setDefaultTenantId(String defaultTenantId) {
        this.defaultTenantId = defaultTenantId;
    }

    public boolean isHeaderResolverEnabled() {
        return headerResolverEnabled;
    }

    public void setHeaderResolverEnabled(boolean headerResolverEnabled) {
        this.headerResolverEnabled = headerResolverEnabled;
    }

    public boolean isSubdomainResolverEnabled() {
        return subdomainResolverEnabled;
    }

    public void setSubdomainResolverEnabled(boolean subdomainResolverEnabled) {
        this.subdomainResolverEnabled = subdomainResolverEnabled;
    }

    public boolean isCustomDomainResolverEnabled() {
        return customDomainResolverEnabled;
    }

    public void setCustomDomainResolverEnabled(boolean customDomainResolverEnabled) {
        this.customDomainResolverEnabled = customDomainResolverEnabled;
    }

    public String getBaseDomain() {
        return baseDomain;
    }

    public void setBaseDomain(String baseDomain) {
        this.baseDomain = baseDomain;
    }
}
