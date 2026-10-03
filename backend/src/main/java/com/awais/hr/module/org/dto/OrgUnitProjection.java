package com.awais.hr.module.org.dto;

import java.time.LocalDateTime;

/**
 * Java 21 Record Projection for optimized DB column retrieval.
 * Selects only specific required OrgUnit columns from MySQL.
 */
public record OrgUnitProjection(
        String id,
        String name,
        String type,
        String parentId,
        String costCode,
        LocalDateTime createdAt
) {}
