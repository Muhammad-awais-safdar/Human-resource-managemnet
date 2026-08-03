package com.awais.hr.module.tenant.infrastructure.datasource;

import com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * Spring AbstractRoutingDataSource extension dynamically returning current lookup key from TenantContextHolder.
 */
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContextHolder.getCurrentTenant();
    }

    public Object getLookupKey() {
        return determineCurrentLookupKey();
    }
}
