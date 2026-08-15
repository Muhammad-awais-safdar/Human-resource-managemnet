package com.awais.hr.module.tenant;

import com.awais.hr.context.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CrossTenantIsolationTest {

    @BeforeEach
    void setUp() {
        TenantContextHolder.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    @DisplayName("Tenant A context set correctly and isolated from null")
    void testTenantAContext() {
        TenantContextHolder.setCurrentTenant("tenant-a-corp");
        assertEquals("tenant-a-corp", TenantContextHolder.getCurrentTenant());
    }

    @Test
    @DisplayName("Switching from Tenant A to Tenant B updates context safely")
    void testTenantSwitching() {
        TenantContextHolder.setCurrentTenant("tenant-a-corp");
        assertEquals("tenant-a-corp", TenantContextHolder.getCurrentTenant());

        TenantContextHolder.setCurrentTenant("tenant-b-llc");
        assertEquals("tenant-b-llc", TenantContextHolder.getCurrentTenant());
        assertNotEquals("tenant-a-corp", TenantContextHolder.getCurrentTenant());
    }

    @Test
    @DisplayName("ThreadLocal clear prevents cross-tenant context bleed")
    void testContextClear() {
        TenantContextHolder.setCurrentTenant("tenant-a-corp");
        TenantContextHolder.clear();
        assertNull(TenantContextHolder.getCurrentTenant());
    }
}
