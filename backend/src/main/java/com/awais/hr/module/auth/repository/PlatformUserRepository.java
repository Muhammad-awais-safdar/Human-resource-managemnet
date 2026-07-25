package com.awais.hr.module.auth.repository;

import com.awais.hr.module.auth.model.PlatformUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformUserRepository extends JpaRepository<PlatformUser, String> {
    Optional<PlatformUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
