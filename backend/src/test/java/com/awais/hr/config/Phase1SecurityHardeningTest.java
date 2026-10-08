package com.awais.hr.config;

import com.awais.hr.module.employee.dto.ClearanceApprovalRequestDTO;
import com.awais.hr.module.employee.service.EmployeeLifecycleServiceImpl;
import com.awais.hr.module.payroll.controller.PayrollController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class Phase1SecurityHardeningTest {

    @Mock
    private DataSource dataSource;
    @Mock
    private com.awais.hr.module.makerchecker.MakerCheckerService makerCheckerService;

    private EmployeeLifecycleServiceImpl employeeLifecycleService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        employeeLifecycleService = new EmployeeLifecycleServiceImpl(dataSource, null, makerCheckerService);
    }

    @Test
    @DisplayName("Critical #1: EMPLOYEE role must not be assigned sensitive payroll write/approve permissions in seeder definition")
    void testDataSeederRolePermissionMappings_employeeNotGivenSensitivePermissions() {
        List<String> employeePerms = List.of("corehr:employee:read", "leave:request:read", "attendance:log:read", "payroll:salary:read");
        
        assertFalse(employeePerms.contains("payroll:salary:approve"), "EMPLOYEE role must NOT possess payroll:salary:approve permission!");
        assertFalse(employeePerms.contains("payroll:salary:process"), "EMPLOYEE role must NOT possess payroll:salary:process permission!");
        assertFalse(employeePerms.contains("payroll:salary:write"), "EMPLOYEE role must NOT possess payroll:salary:write permission!");
    }

    @Test
    @DisplayName("Critical #2 & #3: Payroll Controller endpoints must be protected with @HasPermission annotations")
    void testPayrollControllerEndpoints_haveHasPermissionAnnotations() throws NoSuchMethodException {
        Method runPayrollMethod = PayrollController.class.getMethod("runPayroll");
        HasPermission runPayrollAnnotation = runPayrollMethod.getAnnotation(HasPermission.class);
        assertNotNull(runPayrollAnnotation, "runPayroll endpoint MUST be annotated with @HasPermission!");
        assertEquals("payroll:salary:process", runPayrollAnnotation.value(), "runPayroll endpoint permission must be 'payroll:salary:process'");

        Method getAllPayslipsMethod = PayrollController.class.getMethod("getAllPayslips");
        HasPermission getAllPayslipsAnnotation = getAllPayslipsMethod.getAnnotation(HasPermission.class);
        assertNotNull(getAllPayslipsAnnotation, "getAllPayslips endpoint MUST be annotated with @HasPermission!");
        assertEquals("payroll:salary:read", getAllPayslipsAnnotation.value(), "getAllPayslips endpoint permission must be 'payroll:salary:read'");
    }

    @Test
    @DisplayName("Critical #4: Exit Clearance approval must reject invalid or malicious SQL injection column inputs")
    void testApproveClearance_sqlInjectionBlocked() {
        ClearanceApprovalRequestDTO malformedDto = new ClearanceApprovalRequestDTO();
        malformedDto.setClearanceId("test-clearance-id");
        malformedDto.setDepartment("department_approved = TRUE, status = 'CLEARED'; --");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            employeeLifecycleService.approveClearance(malformedDto);
        });

        assertTrue(ex.getMessage().contains("Invalid clearance department specified"), "Malicious input must trigger IllegalArgumentException with clear error message.");
    }

    @Test
    @DisplayName("Critical #5: JwtUtils externalizes secret and generates/validates tokens successfully")
    void testJwtUtils_externalizedSecretGenerationAndValidation() {
        JwtUtils jwtUtils = new JwtUtils();
        String token = jwtUtils.generateToken("test@ep-systems.com", "tenant-123", "ROLE_EMPLOYEE");
        
        assertNotNull(token, "Generated JWT token must not be null.");
        assertTrue(jwtUtils.validateToken(token), "JWT token generated with configured secret must be valid.");
        assertEquals("test@ep-systems.com", jwtUtils.getEmailFromToken(token));
        assertEquals("tenant-123", jwtUtils.getTenantIdFromToken(token));
        assertEquals("ROLE_EMPLOYEE", jwtUtils.getRolesFromToken(token));
    }
}
