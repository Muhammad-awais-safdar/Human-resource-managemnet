package com.awais.hr.module.tenant.repository;

import com.awais.hr.module.tenant.dto.TenantSummaryProjection;
import com.awais.hr.module.tenant.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("tenantRepository")
public interface TenantRepository extends JpaRepository<Tenant, String> {

    Optional<Tenant> findBySubdomain(String subdomain);
    Optional<Tenant> findByCustomDomain(String customDomain);
    Optional<Tenant> findByName(String name);

    /**
     * Optimized DB Query: Fetches ONLY required tenant summary columns into Java 21 Record.
     */
    @Query("SELECT new com.awais.hr.module.tenant.dto.TenantSummaryProjection(t.id, t.name, t.subdomain, t.type, t.status, t.createdAt) FROM Tenant t")
    List<TenantSummaryProjection> findAllTenantSummaries();

    /**
     * Optimized DB Query: Fetches single tenant summary by subdomain selecting specific columns.
     */
    @Query("SELECT new com.awais.hr.module.tenant.dto.TenantSummaryProjection(t.id, t.name, t.subdomain, t.type, t.status, t.createdAt) FROM Tenant t WHERE t.subdomain = :subdomain")
    Optional<TenantSummaryProjection> findSummaryBySubdomain(@Param("subdomain") String subdomain);
}
