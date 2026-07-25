package com.awais.hr.module.auth.repository;

import com.awais.hr.module.auth.model.PlatformRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformRoleRepository extends JpaRepository<PlatformRole, String> {
    Optional<PlatformRole> findByName(String name);
}
