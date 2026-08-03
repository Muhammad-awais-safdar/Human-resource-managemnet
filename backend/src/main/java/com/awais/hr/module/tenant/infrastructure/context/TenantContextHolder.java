package com.awais.hr.module.tenant.infrastructure.context;

import com.awais.hr.module.tenant.domain.model.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ThreadLocal context holder managing the active tenant context for the current executing thread.
 */
public class TenantContextHolder {

    private static final Logger log = LoggerFactory.getLogger(TenantContextHolder.class);
    private static final ThreadLocal<TenantContext> CONTEXT_HOLDER = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_TENANT_ID = new ThreadLocal<>();

    public static void setContext(TenantContext context) {
        if (context != null) {
            CONTEXT_HOLDER.set(context);
            CURRENT_TENANT_ID.set(context.tenantId());
        }
    }

    public static TenantContext getContext() {
        return CONTEXT_HOLDER.get();
    }

    public static String getCurrentTenant() {
        return CURRENT_TENANT_ID.get();
    }

    public static void setCurrentTenant(String tenantId) {
        CURRENT_TENANT_ID.set(tenantId);
    }

    public static void clear() {
        CONTEXT_HOLDER.remove();
        CURRENT_TENANT_ID.remove();
    }
}
