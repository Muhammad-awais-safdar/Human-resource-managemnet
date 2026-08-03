package com.awais.hr.module.tenant.application.cache;

import com.awais.hr.module.tenant.domain.model.TenantAggregate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cache component storing active tenant aggregates for fast request context resolution.
 */
@Component
public class TenantCache {

    private final Map<String, TenantAggregate> cacheBySubdomain = new ConcurrentHashMap<>();
    private final Map<String, TenantAggregate> cacheById = new ConcurrentHashMap<>();

    public void put(TenantAggregate tenant) {
        if (tenant != null && tenant.getId() != null) {
            cacheById.put(tenant.getId().toString(), tenant);
            if (tenant.getSubdomain() != null) {
                cacheBySubdomain.put(tenant.getSubdomain().toLowerCase(), tenant);
            }
        }
    }

    public Optional<TenantAggregate> getBySubdomain(String subdomain) {
        if (subdomain == null) return Optional.empty();
        return Optional.ofNullable(cacheBySubdomain.get(subdomain.toLowerCase()));
    }

    public Optional<TenantAggregate> getById(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(cacheById.get(id));
    }

    public void evict(String tenantId) {
        TenantAggregate tenant = cacheById.remove(tenantId);
        if (tenant != null && tenant.getSubdomain() != null) {
            cacheBySubdomain.remove(tenant.getSubdomain().toLowerCase());
        }
    }

    public void clear() {
        cacheById.clear();
        cacheBySubdomain.clear();
    }
}
