package com.awais.hr.module.auth.repository;

import com.awais.hr.module.auth.dto.RoleProjection;
import com.awais.hr.module.auth.model.PlatformRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformRoleRepository extends JpaRepository<PlatformRole, String> {
    Optional<PlatformRole> findByName(String name);

    /**
     * Optimized DB Query: Selects ONLY specific role columns into Java 21 Record.
     */
    @Query("SELECT new com.awais.hr.module.auth.dto.RoleProjection(r.id, r.name, r.description) FROM PlatformRole r WHERE r.name = :name")
    Optional<RoleProjection> findRoleProjectionByName(@Param("name") String name);

    /**
     * Optimized DB Query: Selects all roles with required columns only.
     */
    @Query("SELECT new com.awais.hr.module.auth.dto.RoleProjection(r.id, r.name, r.description) FROM PlatformRole r")
    List<RoleProjection> findAllRoleProjections();
}
