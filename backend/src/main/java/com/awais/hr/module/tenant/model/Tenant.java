package com.awais.hr.module.tenant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @Column(length = 50)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VARCHAR)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String subdomain;

    @Column(unique = true, length = 100, name = "custom_domain")
    private String customDomain;

    @Column(nullable = false, name = "db_url")
    private String dbUrl;

    @Column(nullable = false, name = "db_username")
    private String dbUsername;

    @Column(nullable = false, name = "db_password")
    private String dbPassword;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_color", length = 50)
    private String primaryColor;

    @Column(name = "secondary_color", length = 50)
    private String secondaryColor;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
