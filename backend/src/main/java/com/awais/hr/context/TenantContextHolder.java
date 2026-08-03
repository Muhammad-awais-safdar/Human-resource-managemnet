package com.awais.hr.context;

public class TenantContextHolder {

    public static String getCurrentTenant() {
        return com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.getCurrentTenant();
    }

    public static void setCurrentTenant(String tenantId) {
        com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.setCurrentTenant(tenantId);
    }

    public static void clear() {
        com.awais.hr.module.tenant.infrastructure.context.TenantContextHolder.clear();
    }
}
