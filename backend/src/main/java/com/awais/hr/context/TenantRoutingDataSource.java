package com.awais.hr.context;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

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
