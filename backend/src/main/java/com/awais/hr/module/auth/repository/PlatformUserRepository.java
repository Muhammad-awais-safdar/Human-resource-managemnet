package com.awais.hr.module.auth.repository;

import com.awais.hr.module.auth.dto.UserSummaryProjection;
import com.awais.hr.module.auth.model.PlatformUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformUserRepository extends JpaRepository<PlatformUser, String> {
    Optional<PlatformUser> findByEmail(String email);
    boolean existsByEmail(String email);

    /**
     * Optimized DB Query: Fetches ONLY specific user summary columns into Java 21 Record (excluding sensitive fields).
     */
    @Query("SELECT new com.awais.hr.module.auth.dto.UserSummaryProjection(u.id, u.email, CONCAT(u.firstName, ' ', u.lastName), u.status, u.createdAt) FROM PlatformUser u WHERE u.email = :email")
    Optional<UserSummaryProjection> findUserSummaryByEmail(@Param("email") String email);

    /**
     * Optimized DB Query: Fetches list of all platform user summaries selecting required columns only.
     */
    @Query("SELECT new com.awais.hr.module.auth.dto.UserSummaryProjection(u.id, u.email, CONCAT(u.firstName, ' ', u.lastName), u.status, u.createdAt) FROM PlatformUser u")
    List<UserSummaryProjection> findAllUserSummaries();
}
