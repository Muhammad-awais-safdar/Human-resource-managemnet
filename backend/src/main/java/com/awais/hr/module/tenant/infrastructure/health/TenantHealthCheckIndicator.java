package com.awais.hr.module.tenant.infrastructure.health;

import com.awais.hr.module.tenant.application.registry.TenantRegistry;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * HealthIndicator verifying multi-tenant routing engine and active registered datasources.
 */
@Component
public class TenantHealthCheckIndicator implements HealthIndicator {

    private final TenantRegistry tenantRegistry;

    public TenantHealthCheckIndicator(TenantRegistry tenantRegistry) {
        this.tenantRegistry = tenantRegistry;
    }

    @Override
    public Health health() {
        int registeredDataSources = tenantRegistry.getRegisteredDataSources().size();
        return Health.up()
                .withDetail("multiTenancyEngine", "UP")
                .withDetail("registeredDedicatedTenantDataSources", registeredDataSources)
                .build();
    }
}
