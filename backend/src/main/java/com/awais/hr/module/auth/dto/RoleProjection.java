package com.awais.hr.module.auth.dto;

/**
 * Java 21 Record Projection for Role selection queries.
 */
public record RoleProjection(
        String id,
        String name,
        String description
) {}
