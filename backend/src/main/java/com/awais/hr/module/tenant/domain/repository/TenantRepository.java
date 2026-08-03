package com.awais.hr.module.tenant.domain.repository;

import com.awais.hr.module.tenant.domain.model.TenantAggregate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Domain Repository Interface for Tenant Aggregate persistence operations.
 */
public interface TenantRepository {
    Optional<TenantAggregate> findById(UUID id);
    Optional<TenantAggregate> findBySubdomain(String subdomain);
    Optional<TenantAggregate> findByCustomDomain(String customDomain);
    List<TenantAggregate> findAllActiveTenants();
    TenantAggregate save(TenantAggregate tenant);
}
