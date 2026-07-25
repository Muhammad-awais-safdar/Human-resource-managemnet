package com.awais.hr.module.auth.repository;

import com.awais.hr.module.auth.model.PlatformImpersonationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlatformImpersonationLogRepository extends JpaRepository<PlatformImpersonationLog, String> {
    List<PlatformImpersonationLog> findByImpersonatorEmailOrderByCreatedAtDesc(String impersonatorEmail);
    List<PlatformImpersonationLog> findByTargetSubdomainOrderByCreatedAtDesc(String targetSubdomain);
}
