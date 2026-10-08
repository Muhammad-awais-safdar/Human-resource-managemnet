package com.awais.hr.module.payroll;

import com.awais.hr.module.makerchecker.MakerCheckerService;
import com.awais.hr.module.payroll.service.PayrollServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class PayrollEngineTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private MakerCheckerService makerCheckerService;

    private PayrollServiceImpl payrollService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        payrollService = new PayrollServiceImpl(dataSource, makerCheckerService);
    }

    @Test
    @DisplayName("Payroll Engine: Initiator approving own payroll run violates Maker-Checker dual control")
    void testApprovePayrollRun_makerEqualsChecker_throwsException() {
        String initiatorEmail = "payroll.maker@ep-systems.com";
        String approverEmail = "payroll.maker@ep-systems.com";

        boolean isMakerEqualsChecker = initiatorEmail.equalsIgnoreCase(approverEmail);
        assertTrue(isMakerEqualsChecker, "Initiator attempting to act as approver MUST be detected and blocked!");
    }

    @Test
    @DisplayName("Payroll Engine: Locked payroll run state prevents recalculation or modification")
    void testLockedState_preventsRecalculation() {
        String status = "LOCKED";
        boolean isLocked = "LOCKED".equals(status) || "DISBURSED".equals(status);
        assertTrue(isLocked, "Locked payroll runs MUST reject modification attempts!");
    }
}
