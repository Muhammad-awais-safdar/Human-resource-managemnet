package com.awais.hr.module.tenant.infrastructure.datasource;

import com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * Spring AbstractRoutingDataSource extension dynamically returning current lookup key from TenantContextHolder.
 */
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        String tenant = TenantContextHolder.getCurrentTenant();
        if (tenant == null || "MASTER".equalsIgnoreCase(tenant) || "platform".equalsIgnoreCase(tenant) || "system".equalsIgnoreCase(tenant)) {
            return "MASTER";
        }
        return tenant;
    }

    public Object getLookupKey() {
        return determineCurrentLookupKey();
    }
}
