package com.awais.hr.module.tenant.application.resolver;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

/**
 * Strategy interface for resolving tenant identification from incoming HTTP requests.
 */
public interface TenantResolver {
    Optional<String> resolveTenantId(HttpServletRequest request);
    int getOrder();
}
