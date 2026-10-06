package com.awais.hr.module.employee;

import com.awais.hr.module.employee.service.EmployeeLifecycleServiceImpl;
import com.awais.hr.module.makerchecker.service.MakerCheckerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class EmployeeLifecycleTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MakerCheckerService makerCheckerService;

    private EmployeeLifecycleServiceImpl lifecycleService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        lifecycleService = new EmployeeLifecycleServiceImpl(dataSource, passwordEncoder, makerCheckerService);
    }

    @Test
    @DisplayName("Employee Lifecycle: Invalid state transition throws IllegalArgumentException")
    void testTransitionEmployeeState_invalidState_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            lifecycleService.transitionEmployeeState("emp-101", "SUPER_ACTIVE", "PROMOTION", "2026-10-10", "Invalid target status test", "admin@ep-systems.com");
        });
    }
}
