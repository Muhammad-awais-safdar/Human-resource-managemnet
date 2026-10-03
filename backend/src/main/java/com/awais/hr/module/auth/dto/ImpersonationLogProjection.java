package com.awais.hr.module.auth.dto;

import java.time.LocalDateTime;

/**
 * Java 21 Record Projection for Impersonation Log selection queries.
 */
public record ImpersonationLogProjection(
        String id,
        String impersonatorEmail,
        String targetSubdomain,
        String reason,
        LocalDateTime createdAt
) {}
