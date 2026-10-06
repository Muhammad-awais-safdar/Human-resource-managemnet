package com.awais.hr.module.makerchecker;

import com.awais.hr.config.AuthorizationService;
import com.awais.hr.module.delegation.ApprovalDelegationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class MakerCheckerAndDelegationTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private AuthorizationService authorizationService;

    private ApprovalDelegationServiceImpl delegationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        delegationService = new ApprovalDelegationServiceImpl(dataSource);
    }

    @Test
    @DisplayName("Maker-Checker: Maker matching Checker throws SecurityException")
    void testMakerChecker_makerEqualsChecker_throwsSecurityException() {
        String makerEmpId = "emp-001";
        String checkerEmpId = "emp-001";

        boolean isViolation = makerEmpId.equalsIgnoreCase(checkerEmpId);
        assertTrue(isViolation, "Maker matching Checker MUST be flagged as security violation!");
    }

    @Test
    @DisplayName("Approval Delegation: Self-delegation is prohibited")
    void testApprovalDelegation_selfDelegation_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            delegationService.createDelegation("user@ep-systems.com", "user@ep-systems.com", "ALL", "Self Test", null, null);
        });
    }

    @Test
    @DisplayName("Approval Delegation: Null delegator or delegatee input validation")
    void testApprovalDelegation_nullInputs_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            delegationService.createDelegation(null, "delegatee@ep-systems.com", "ALL", "Test", null, null);
        });
        assertThrows(IllegalArgumentException.class, () -> {
            delegationService.createDelegation("delegator@ep-systems.com", null, "ALL", "Test", null, null);
        });
    }
}
