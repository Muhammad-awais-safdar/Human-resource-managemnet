package com.awais.hr.module.auth.dto;

import java.time.LocalDateTime;

/**
 * Java 21 Record Projection for optimized DB column retrieval.
 * Selects only specific required PlatformUser columns (excluding password, metadata) from MySQL.
 */
public record UserSummaryProjection(
        String id,
        String email,
        String fullName,
        String status,
        LocalDateTime createdAt
) {}
