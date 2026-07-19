package com.awais.hr.context;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContextHolder.getCurrentTenant();
    }

    public Object getLookupKey() {
        return determineCurrentLookupKey();
    }
}
