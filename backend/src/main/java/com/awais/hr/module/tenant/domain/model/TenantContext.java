package com.awais.hr.module.tenant.domain.model;

import com.awais.hr.common.domain.ValueObject;

/**
 * Immutable Context Value Object representing the resolved tenant context bound to the active request thread.
 */
public record TenantContext(
    String tenantId,
    String subdomain,
    TenantStatus status,
    TenantType type
) implements ValueObject {}
