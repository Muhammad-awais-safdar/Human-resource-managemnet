package com.awais.hr.module.auth.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "platform_role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformRole {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 255)
    private String description;
}
