package com.awais.hr.module.tenant.domain.model;

import com.awais.hr.common.domain.ValueObject;

/**
 * Value Object encapsulating connection credentials and schema details for tenant database routing.
 */
public record TenantDatabaseConfiguration(
    String dbUrl,
    String dbUsername,
    String dbPassword,
    String schemaName
) implements ValueObject {}
