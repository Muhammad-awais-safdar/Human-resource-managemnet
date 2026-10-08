package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import javax.sql.DataSource;
import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PermissionAspectTest {

    @Mock
    private DataSource dataSource;
    @Mock
    private AuthorizationService authorizationService;
    @Mock
    private JoinPoint joinPoint;
    @Mock
    private MethodSignature methodSignature;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    private PermissionAspect permissionAspect;

    @BeforeEach
    public void setUp() throws Exception {
        permissionAspect = new PermissionAspect(dataSource, null, authorizationService);
        SecurityContextHolder.setContext(securityContext);
        TenantContextHolder.setCurrentTenant("test-tenant-uuid");
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
        TenantContextHolder.clear();
    }

    @Test
    public void checkPermission_shouldThrowException_whenPermissionCountIsZero() throws Exception {
        // Arrange annotation mock
        Method method = MockController.class.getMethod("dummyMethod");
        when(joinPoint.getSignature()).thenReturn(methodSignature);
        when(methodSignature.getMethod()).thenReturn(method);

        // Arrange authentication mock
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("test@user.com");

        when(authorizationService.hasPermission("test@user.com", "corehr:employee:read")).thenReturn(false);

        assertThrows(SecurityException.class, () -> {
            permissionAspect.checkPermission(joinPoint);
        });
    }

    @Test
    public void checkPermission_shouldPass_whenPermissionCountIsOne() throws Exception {
        // Arrange annotation mock
        Method method = MockController.class.getMethod("dummyMethod");
        when(joinPoint.getSignature()).thenReturn(methodSignature);
        when(methodSignature.getMethod()).thenReturn(method);

        // Arrange authentication mock
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("test@user.com");

        when(authorizationService.hasPermission("test@user.com", "corehr:employee:read")).thenReturn(true);

        // Action should execute without throwing exception
        permissionAspect.checkPermission(joinPoint);

        verify(authorizationService, times(1)).hasPermission("test@user.com", "corehr:employee:read");
    }

    static class MockController {
        @HasPermission("corehr:employee:read")
        public void dummyMethod() {}
    }
}
