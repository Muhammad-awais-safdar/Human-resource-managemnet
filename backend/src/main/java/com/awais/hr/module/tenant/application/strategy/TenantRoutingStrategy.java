package com.awais.hr.module.tenant.application.strategy;

import com.awais.hr.module.tenant.domain.model.TenantAggregate;
import com.awais.hr.module.tenant.domain.model.TenantType;
import org.springframework.stereotype.Component;

/**
 * Strategy service resolving multi-tenant isolation routing strategy.
 */
@Component
public class TenantRoutingStrategy {

    public boolean requiresDedicatedDataSource(TenantAggregate tenant) {
        return tenant != null && (tenant.getType() == TenantType.DEDICATED_DATABASE || tenant.getType() == TenantType.DEDICATED_SCHEMA);
    }

    public String resolveLookupKey(TenantAggregate tenant) {
        if (tenant == null) {
            return "DEFAULT";
        }
        return tenant.getId().toString();
    }
}
