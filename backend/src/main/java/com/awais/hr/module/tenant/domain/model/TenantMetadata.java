package com.awais.hr.module.tenant.domain.model;

import com.awais.hr.common.domain.ValueObject;

/**
 * Value Object encapsulating brand and localization metadata for a tenant.
 */
public record TenantMetadata(
    String logoUrl,
    String primaryColor,
    String secondaryColor,
    String customDomain
) implements ValueObject {}
