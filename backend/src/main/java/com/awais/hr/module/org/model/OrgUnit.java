package com.awais.hr.module.org.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "org_unit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrgUnit {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 30)
    private String type; // LEGAL_ENTITY, COST_CENTER, DEPARTMENT, TEAM

    @Column(name = "parent_id", length = 50)
    private String parentId;

    @Column(name = "manager_id", length = 50)
    private String managerId;

    @Column(name = "cost_code", length = 50)
    private String costCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
