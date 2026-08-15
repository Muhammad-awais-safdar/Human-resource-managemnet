package com.awais.hr.module.tenant.application.registry;

import com.awais.hr.module.tenant.domain.model.TenantAggregate;
import com.awais.hr.module.tenant.infrastructure.datasource.TenantRoutingDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registry managing active tenant DataSources dynamically in TenantRoutingDataSource.
 */
@Component
public class TenantRegistry {

    private static final Logger log = LoggerFactory.getLogger(TenantRegistry.class);
    private final Map<Object, Object> targetDataSources = new ConcurrentHashMap<>();
    private final TenantRoutingDataSource routingDataSource;
    private final DataSource masterDataSource;

    public TenantRegistry(TenantRoutingDataSource routingDataSource, @org.springframework.beans.factory.annotation.Qualifier("masterDataSource") DataSource masterDataSource) {
        this.routingDataSource = routingDataSource;
        this.masterDataSource = masterDataSource;
    }

    public void registerTenantDataSource(TenantAggregate tenant) {
        if (tenant.getDatabaseConfiguration() == null || tenant.getDatabaseConfiguration().dbUrl() == null) {
            log.debug("Tenant {} uses default shared database source", tenant.getId());
            return;
        }

        DataSource ds = DataSourceBuilder.create()
                .url(tenant.getDatabaseConfiguration().dbUrl())
                .username(tenant.getDatabaseConfiguration().dbUsername())
                .password(tenant.getDatabaseConfiguration().dbPassword())
                .driverClassName("org.postgresql.Driver")
                .build();

        targetDataSources.put("MASTER", masterDataSource);
        targetDataSources.put(tenant.getId().toString(), ds);
        if (tenant.getSubdomain() != null) {
            targetDataSources.put(tenant.getSubdomain().toLowerCase().trim(), ds);
        }
        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(masterDataSource);
        routingDataSource.afterPropertiesSet();
        log.info("Successfully registered dedicated DataSource for tenant ID: {}", tenant.getId());
    }

    public Map<Object, Object> getRegisteredDataSources() {
        return Map.copyOf(targetDataSources);
    }
}
