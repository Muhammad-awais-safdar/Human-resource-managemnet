package com.awais.hr.module.auth.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "platform_impersonation_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformImpersonationLog {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "impersonator_email", nullable = false, length = 100)
    private String impersonatorEmail;

    @Column(name = "target_tenant_id", nullable = false, length = 50)
    private String targetTenantId;

    @Column(name = "target_subdomain", nullable = false, length = 50)
    private String targetSubdomain;

    @Column(name = "impersonated_role", nullable = false, length = 50)
    private String impersonatedRole;

    @Column(length = 255)
    private String reason;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
