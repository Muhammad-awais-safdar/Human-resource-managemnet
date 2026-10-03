package com.awais.hr.module.tenant.dto;

import com.awais.hr.module.tenant.domain.model.TenantStatus;
import com.awais.hr.module.tenant.domain.model.TenantType;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Java 21 Record Projection for optimized DB column retrieval.
 * Fetches only the required Tenant summary columns from MySQL.
 */
public record TenantSummaryProjection(
        String id,
        String name,
        String subdomain,
        String type,
        String status,
        LocalDateTime createdAt
) {
    public TenantSummaryProjection(String id, String name, String subdomain, String type, String status, Instant createdAt) {
        this(
                id,
                name,
                subdomain,
                type,
                status,
                createdAt != null ? LocalDateTime.ofInstant(createdAt, ZoneId.systemDefault()) : null
        );
    }

    public TenantSummaryProjection(String id, String name, String subdomain, TenantType type, TenantStatus status, Instant createdAt) {
        this(
                id,
                name,
                subdomain,
                type != null ? type.name() : null,
                status != null ? status.name() : null,
                createdAt != null ? LocalDateTime.ofInstant(createdAt, ZoneId.systemDefault()) : null
        );
    }

    public TenantSummaryProjection(String id, String name, String subdomain, TenantType type, TenantStatus status, LocalDateTime createdAt) {
        this(
                id,
                name,
                subdomain,
                type != null ? type.name() : null,
                status != null ? status.name() : null,
                createdAt
        );
    }
}
