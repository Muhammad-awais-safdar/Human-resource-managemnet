package com.awais.hr.module.tenant.infrastructure.persistence;

import com.awais.hr.common.domain.BaseEntity;
import com.awais.hr.module.tenant.domain.model.TenantStatus;
import com.awais.hr.module.tenant.domain.model.TenantType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tenant")
public class TenantEntity extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "subdomain", nullable = false, unique = true)
    private String subdomain;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TenantStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TenantType type;

    @Column(name = "custom_domain")
    private String customDomain;

    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "secondary_color")
    private String secondaryColor;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "db_url")
    private String dbUrl;

    @Column(name = "db_username")
    private String dbUsername;

    @Column(name = "db_password")
    private String dbPassword;
}
