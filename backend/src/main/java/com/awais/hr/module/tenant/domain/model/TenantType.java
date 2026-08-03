package com.awais.hr.module.tenant.domain.model;

/**
 * Multi-tenancy isolation architecture type for a tenant instance.
 */
public enum TenantType {
    SHARED_SCHEMA,
    DEDICATED_SCHEMA,
    DEDICATED_DATABASE
}
