package com.awais.hr.module.tenant.infrastructure.persistence;

import com.awais.hr.module.tenant.domain.model.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantJpaRepository extends JpaRepository<TenantEntity, UUID> {
    Optional<TenantEntity> findBySubdomain(String subdomain);
    Optional<TenantEntity> findByCustomDomain(String customDomain);
    List<TenantEntity> findByStatus(TenantStatus status);
}
