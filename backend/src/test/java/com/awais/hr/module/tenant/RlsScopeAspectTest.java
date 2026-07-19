package com.awais.hr.module.tenant;

import com.awais.hr.context.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class RlsScopeAspectTest {

    @BeforeEach
    public void setUp() {
        TenantContextHolder.clear();
    }

    @AfterEach
    public void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    public void contextHolder_shouldStoreActiveTenantId() {
        assertNull(TenantContextHolder.getCurrentTenant());
        TenantContextHolder.setCurrentTenant("test-tenant-id");
        assertEquals("test-tenant-id", TenantContextHolder.getCurrentTenant());
    }

    @Test
    public void contextHolder_shouldClearContext() {
        TenantContextHolder.setCurrentTenant("test-tenant-id");
        TenantContextHolder.clear();
        assertNull(TenantContextHolder.getCurrentTenant());
    }
}
