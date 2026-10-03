package com.awais.hr.module.auth.repository;

import com.awais.hr.module.auth.dto.ImpersonationLogProjection;
import com.awais.hr.module.auth.model.PlatformImpersonationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlatformImpersonationLogRepository extends JpaRepository<PlatformImpersonationLog, String> {
    List<PlatformImpersonationLog> findByImpersonatorEmailOrderByCreatedAtDesc(String impersonatorEmail);
    List<PlatformImpersonationLog> findByTargetSubdomainOrderByCreatedAtDesc(String targetSubdomain);

    /**
     * Optimized DB Query: Selects ONLY specific impersonation log columns into Java 21 Record by impersonator email.
     */
    @Query("SELECT new com.awais.hr.module.auth.dto.ImpersonationLogProjection(l.id, l.impersonatorEmail, l.targetSubdomain, l.reason, l.createdAt) FROM PlatformImpersonationLog l WHERE l.impersonatorEmail = :email ORDER BY l.createdAt DESC")
    List<ImpersonationLogProjection> findProjectionsByImpersonatorEmail(@Param("email") String email);

    /**
     * Optimized DB Query: Selects ONLY specific impersonation log columns into Java 21 Record by target subdomain.
     */
    @Query("SELECT new com.awais.hr.module.auth.dto.ImpersonationLogProjection(l.id, l.impersonatorEmail, l.targetSubdomain, l.reason, l.createdAt) FROM PlatformImpersonationLog l WHERE l.targetSubdomain = :subdomain ORDER BY l.createdAt DESC")
    List<ImpersonationLogProjection> findProjectionsByTargetSubdomain(@Param("subdomain") String subdomain);
}
