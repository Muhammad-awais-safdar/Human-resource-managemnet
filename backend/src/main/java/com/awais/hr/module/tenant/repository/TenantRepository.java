package com.awais.hr.module.tenant.repository;

import com.awais.hr.module.tenant.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, String> {
    Optional<Tenant> findBySubdomain(String subdomain);
    Optional<Tenant> findByCustomDomain(String customDomain);
    Optional<Tenant> findByName(String name);
}
