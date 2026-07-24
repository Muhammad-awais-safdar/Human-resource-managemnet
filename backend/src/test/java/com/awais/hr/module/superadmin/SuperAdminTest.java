package com.awais.hr.module.superadmin;

import com.awais.hr.module.superadmin.service.SuperAdminTenantService;
import com.awais.hr.module.superadmin.service.SuperAdminTenantServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class SuperAdminTest {

    @Mock
    private DataSource dataSource;

    private SuperAdminTenantService adminService;

    @BeforeEach
    public void setUp() {
        adminService = new SuperAdminTenantServiceImpl(dataSource);
    }

    @Test
    public void logTenantAction_shouldThrowException_whenTenantNameIsBlank() {
        Map<String, Object> body = Map.of("tenantName", " ");
        assertThrows(IllegalArgumentException.class, () -> adminService.logTenantAction(body));
    }
}
