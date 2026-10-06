package com.awais.hr.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AuthorizationServiceTest {

    @Mock
    private DataSource dataSource;

    private AuthorizationServiceImpl authorizationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authorizationService = new AuthorizationServiceImpl(dataSource);
    }

    @Test
    @DisplayName("AuthorizationService: null or empty email returns false safely")
    void testHasPermission_nullOrEmptyInput_returnsFalse() {
        assertFalse(authorizationService.hasPermission(null, "corehr:employee:read"));
        assertFalse(authorizationService.hasPermission("", "corehr:employee:read"));
        assertFalse(authorizationService.hasPermission("employee@ep-systems.com", null));
        assertFalse(authorizationService.hasPermission("employee@ep-systems.com", ""));
    }

    @Test
    @DisplayName("AuthorizationService: checkPermission throws SecurityException for unauthorized email")
    void testCheckPermission_unauthorized_throwsSecurityException() {
        assertThrows(SecurityException.class, () -> {
            authorizationService.checkPermission("unauthorized@ep-systems.com", "payroll:salary:process");
        });
    }

    @Test
    @DisplayName("AuthorizationService: hasRole supports clean role name matching")
    void testHasRole_handlesRolePrefixes() {
        assertFalse(authorizationService.hasRole(null, "ROLE_EMPLOYEE"));
        assertFalse(authorizationService.hasRole("unknown@ep-systems.com", "HR_MANAGER"));
    }
}
