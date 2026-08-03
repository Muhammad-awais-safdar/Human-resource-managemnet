package com.awais.hr.common.domain;

import java.util.Objects;

public record TenantId(String value) implements ValueObject {
    public TenantId {
        Objects.requireNonNull(value, "Tenant ID value cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("Tenant ID value cannot be blank");
        }
    }

    public static TenantId of(String value) {
        return new TenantId(value);
    }
}
