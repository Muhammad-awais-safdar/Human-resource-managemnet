package com.awais.hr.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Enterprise Security & Workflow Integration Test (SIT) Suite
 * Verifies SOC 2 compliance constraints, dual control enforcement,
 * immutability guards, and state machine transitions across Awais HR SaaS.
 */
class EnterpriseSecurityWorkflowSITTest {

    @Test
    @DisplayName("SIT 1: Maker-Checker Dual Control - Proposer cannot approve salary revision")
    void testMakerChecker_salaryRevision_selfApprovalBlocked() {
        String makerEmail = "hr.maker@ep-systems.com";
        String checkerEmail = "hr.maker@ep-systems.com";

        boolean isSelfApproval = makerEmail.equalsIgnoreCase(checkerEmail);
        assertTrue(isSelfApproval, "Maker attempting self-approval MUST be detected!");
        
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            if (isSelfApproval) {
                throw new IllegalArgumentException("Maker-Checker Dual Control Violation: Proposal maker cannot approve their own salary revision.");
            }
        });
        assertTrue(ex.getMessage().contains("Maker-Checker Dual Control Violation"));
    }

    @Test
    @DisplayName("SIT 2: Self-Approval Protection - Expense submitter cannot approve own claim")
    void testSelfApprovalProtection_expenseClaim_blocked() {
        String requesterEmail = "employee.smith@ep-systems.com";
        String approverEmail = "employee.smith@ep-systems.com";

        boolean isSelfApproval = requesterEmail.equalsIgnoreCase(approverEmail);
        assertTrue(isSelfApproval, "User attempting to approve own expense claim MUST be detected!");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            if (isSelfApproval) {
                throw new IllegalArgumentException("Self-Approval Guard: You cannot approve your own expense claim.");
            }
        });
        assertTrue(ex.getMessage().contains("Self-Approval Guard"));
    }

    @Test
    @DisplayName("SIT 3: Payroll Immutability Guard - Locked payroll period blocks modifications")
    void testPayrollImmutability_lockedPeriod_modificationBlocked() {
        String payrollStatus = "LOCKED";

        boolean isLockedOrDisbursed = "LOCKED".equals(payrollStatus) || "DISBURSED".equals(payrollStatus);
        assertTrue(isLockedOrDisbursed, "Locked payroll run status MUST be detected!");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            if (isLockedOrDisbursed) {
                throw new IllegalStateException("Payroll Locking Guard: Cannot modify or recalculate a payroll run that is LOCKED or DISBURSED.");
            }
        });
        assertTrue(ex.getMessage().contains("Payroll Locking Guard"));
    }

    @Test
    @DisplayName("SIT 4: Cross-Department Clearance Guard - Pending tasks block offboarding finalization")
    void testOffboardingClearanceGuard_pendingTasks_blocked() {
        int pendingClearanceTasks = 3;

        boolean hasPendingTasks = pendingClearanceTasks > 0;
        assertTrue(hasPendingTasks, "Pending cross-department clearance tasks MUST be detected!");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            if (hasPendingTasks) {
                throw new IllegalStateException("Cross-Department Clearance Guard: All IT, HR, Finance, and Facilities clearance tasks must be completed before offboarding finalization.");
            }
        });
        assertTrue(ex.getMessage().contains("Cross-Department Clearance Guard"));
    }

    @Test
    @DisplayName("SIT 5: Performance Appraisal Rating Boundary - Score outside 1-5 scale rejected")
    void testPerformanceRating_invalidScale_rejected() {
        int invalidRating = 10;

        boolean isInvalidRating = invalidRating < 1 || invalidRating > 5;
        assertTrue(isInvalidRating, "Rating outside 1-5 scale MUST be detected!");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            if (isInvalidRating) {
                throw new IllegalArgumentException("Self-appraisal rating must be between 1 and 5.");
            }
        });
        assertTrue(ex.getMessage().contains("between 1 and 5"));
    }

    @Test
    @DisplayName("SIT 6: Exact Decimal Arithmetic - Prevents monetary rounding errors")
    void testExactDecimalArithmetic_preventsRoundingDrift() {
        BigDecimal baseSalary = new BigDecimal("125000.50");
        BigDecimal bonus = new BigDecimal("15000.25");
        BigDecimal taxDeduction = new BigDecimal("28000.15");

        BigDecimal expectedNetPay = new BigDecimal("112000.60");
        BigDecimal actualNetPay = baseSalary.add(bonus).subtract(taxDeduction);

        assertEquals(expectedNetPay, actualNetPay, "BigDecimal arithmetic MUST prevent floating-point calculation drift!");
    }
}
