package com.awais.hr.module.tenant.domain.model;

import com.awais.hr.common.domain.ValueObject;
import java.util.Set;

/**
 * Value Object specifying feature module limits and entitlements for a tenant.
 */
public record TenantConfiguration(
    int maxUsers,
    long maxStorageMb,
    Set<String> enabledModules
) implements ValueObject {}
