package com.awais.hr.module.tenant.application.loader;

import com.awais.hr.module.tenant.application.registry.TenantRegistry;
import com.awais.hr.module.tenant.domain.model.TenantAggregate;
import com.awais.hr.module.tenant.domain.repository.TenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Listener initializing active tenant database connections upon application boot.
 */
@Component
public class TenantBootstrapLoader {

    private static final Logger log = LoggerFactory.getLogger(TenantBootstrapLoader.class);

    private final TenantRepository tenantRepository;
    private final TenantRegistry tenantRegistry;

    public TenantBootstrapLoader(TenantRepository tenantRepository, TenantRegistry tenantRegistry) {
        this.tenantRepository = tenantRepository;
        this.tenantRegistry = tenantRegistry;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Initializing active tenant database connections on startup...");
        try {
            List<TenantAggregate> activeTenants = tenantRepository.findAllActiveTenants();
            for (TenantAggregate tenant : activeTenants) {
                tenantRegistry.registerTenantDataSource(tenant);
            }
            log.info("Successfully bootstrapped {} active tenant connections.", activeTenants.size());
        } catch (Exception e) {
            log.warn("Could not bootstrap tenant connections on startup: {}", e.getMessage());
        }
    }
}
