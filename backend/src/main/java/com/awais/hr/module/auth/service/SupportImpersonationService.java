package com.awais.hr.module.auth.service;

import com.awais.hr.config.JwtUtils;
import com.awais.hr.module.auth.model.PlatformImpersonationLog;
import com.awais.hr.module.auth.model.PlatformUser;
import com.awais.hr.module.auth.repository.PlatformImpersonationLogRepository;
import com.awais.hr.module.auth.repository.PlatformUserRepository;
import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupportImpersonationService {

    private final PlatformUserRepository platformUserRepository;
    private final TenantRepository tenantRepository;
    private final PlatformImpersonationLogRepository impersonationLogRepository;
    private final JwtUtils jwtUtils;

    @Transactional
    public String createImpersonationToken(String impersonatorEmail, String targetSubdomain, String reason, String ipAddress, int durationMinutes) {
        log.info("[SUPPORT IMPERSONATION] Initiating support session by: {} for tenant subdomain: {}", impersonatorEmail, targetSubdomain);

        PlatformUser platformUser = platformUserRepository.findByEmail(impersonatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Platform administrator profile not found: " + impersonatorEmail));

        boolean isAuthorized = platformUser.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN") || r.getName().equals("PLATFORM_SUPPORT"));

        if (!isAuthorized) {
            throw new SecurityException("Unauthorized: Only SYSTEM_ADMIN or PLATFORM_SUPPORT role can initiate support impersonation sessions.");
        }

        Tenant targetTenant = tenantRepository.findBySubdomain(targetSubdomain)
                .orElseThrow(() -> new IllegalArgumentException("Target tenant workspace not found for subdomain: " + targetSubdomain));

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(durationMinutes > 0 ? durationMinutes : 30);
        String impersonatedRole = "SUPPORT_IMPERSONATOR";

        // Audit Log Entry
        PlatformImpersonationLog auditLog = PlatformImpersonationLog.builder()
                .id(UUID.randomUUID().toString())
                .impersonatorEmail(impersonatorEmail)
                .targetTenantId(targetTenant.getId())
                .targetSubdomain(targetTenant.getSubdomain())
                .impersonatedRole(impersonatedRole)
                .reason(reason != null ? reason : "Platform Technical Support Session")
                .ipAddress(ipAddress)
                .expiresAt(expiresAt)
                .createdAt(LocalDateTime.now())
                .build();

        impersonationLogRepository.save(auditLog);

        log.info("[SUPPORT IMPERSONATION LOGGED] Session ID: {} logged for impersonator: {} on tenant: {}", auditLog.getId(), impersonatorEmail, targetSubdomain);

        // Generate Impersonation JWT Token mapped to target tenant context
        return jwtUtils.generateToken(
                impersonatorEmail,
                targetTenant.getId(),
                "TENANT_ADMIN,SUPPORT_IMPERSONATOR"
        );
    }

    public List<PlatformImpersonationLog> getImpersonationLogsForTenant(String subdomain) {
        return impersonationLogRepository.findByTargetSubdomainOrderByCreatedAtDesc(subdomain);
    }
}
