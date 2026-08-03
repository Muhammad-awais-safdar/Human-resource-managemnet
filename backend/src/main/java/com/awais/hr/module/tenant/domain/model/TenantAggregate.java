package com.awais.hr.module.tenant.domain.model;

import com.awais.hr.common.domain.AggregateRoot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Domain Aggregate Root representing a SaaS Tenant instance.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantAggregate extends AggregateRoot {

    private String name;
    private String subdomain;
    private TenantStatus status;
    private TenantType type;
    private TenantMetadata metadata;
    private TenantConfiguration configuration;
    private TenantDatabaseConfiguration databaseConfiguration;

    public boolean isActive() {
        return this.status == TenantStatus.ACTIVE;
    }
}
