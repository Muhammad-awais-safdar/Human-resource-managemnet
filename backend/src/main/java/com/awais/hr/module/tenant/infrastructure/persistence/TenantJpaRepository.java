package com.awais.hr.module.tenant.infrastructure.persistence;

import com.awais.hr.module.tenant.domain.model.TenantStatus;
import com.awais.hr.module.tenant.dto.TenantSummaryProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantJpaRepository extends JpaRepository<TenantEntity, UUID> {
    Optional<TenantEntity> findBySubdomain(String subdomain);
    Optional<TenantEntity> findByCustomDomain(String customDomain);
    List<TenantEntity> findByStatus(TenantStatus status);

    /**
     * Optimized DB Query: Selects ONLY specific tenant entity columns into Java 21 Record by status.
     */
    @Query("SELECT new com.awais.hr.module.tenant.dto.TenantSummaryProjection(CAST(t.id AS string), t.name, t.subdomain, CAST(t.type AS string), CAST(t.status AS string), t.createdAt) FROM TenantEntity t WHERE t.status = :status")
    List<TenantSummaryProjection> findSummaryProjectionsByStatus(@Param("status") TenantStatus status);

    /**
     * Optimized DB Query: Selects all tenant summary entity projections with required columns only.
     */
    @Query("SELECT new com.awais.hr.module.tenant.dto.TenantSummaryProjection(CAST(t.id AS string), t.name, t.subdomain, CAST(t.type AS string), CAST(t.status AS string), t.createdAt) FROM TenantEntity t")
    List<TenantSummaryProjection> findAllSummaryProjections();
}
