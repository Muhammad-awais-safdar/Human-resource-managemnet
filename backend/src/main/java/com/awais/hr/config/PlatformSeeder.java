package com.awais.hr.config;

import com.awais.hr.module.auth.model.PlatformRole;
import com.awais.hr.module.auth.model.PlatformUser;
import com.awais.hr.module.auth.repository.PlatformRoleRepository;
import com.awais.hr.module.auth.repository.PlatformUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class PlatformSeeder implements CommandLineRunner {

    private final PlatformUserRepository platformUserRepository;
    private final PlatformRoleRepository platformRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.clear();
        log.info("========================================================================");
        log.info("🛡️ SEEDING PLATFORM ROLES & SUPERADMIN ACCOUNTS (MASTER DB)...");
        log.info("========================================================================");

        Map<String, String> platformRoles = Map.of(
                "SYSTEM_ADMIN", "Full SaaS Platform Infrastructure & Multi-Tenant Administrator",
                "PLATFORM_SUPPORT", "Tier-3 Enterprise Platform Support Specialist",
                "DEVOPS_ENGINEER", "Cloud Infrastructure, Deployment & Observability Controller",
                "SECURITY_ADMIN", "Platform Cyber-Security & IAM Compliance Officer",
                "BILLING_ADMIN", "SaaS Subscriptions, Invoicing & Financial Operations",
                "PRODUCT_MANAGER", "SaaS Feature Flags & System Module Product Manager"
        );

        for (Map.Entry<String, String> entry : platformRoles.entrySet()) {
            if (platformRoleRepository.findByName(entry.getKey()).isEmpty()) {
                platformRoleRepository.save(PlatformRole.builder()
                        .id(UUID.randomUUID().toString())
                        .name(entry.getKey())
                        .description(entry.getValue())
                        .build());
                log.info("Seeded platform role: {}", entry.getKey());
            }
        }

        // Seed Default Platform SuperAdmins
        List<String> superAdminEmails = List.of("admin@hrm.com", "admin@awais.com");
        for (String superAdminEmail : superAdminEmails) {
            if (platformUserRepository.findByEmail(superAdminEmail).isEmpty()) {
                PlatformRole adminRole = platformRoleRepository.findByName("SYSTEM_ADMIN")
                        .orElseThrow();

                PlatformUser superAdmin = PlatformUser.builder()
                        .id(UUID.randomUUID().toString())
                        .email(superAdminEmail)
                        .password(passwordEncoder.encode("admin123"))
                        .firstName("Platform")
                        .lastName("Administrator")
                        .status("ACTIVE")
                        .roles(Set.of(adminRole))
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                platformUserRepository.save(superAdmin);
                log.info("✅ Platform SuperAdmin created successfully: {} / Password: admin123", superAdminEmail);
            }
        }

        log.info("========================================================================");
    }
}
