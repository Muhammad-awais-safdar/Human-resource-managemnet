package com.awais.hr.module.employee;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class EmployeeLifecycleTest {

    private boolean isValidTransition(String currentStatus, String targetStatus) {
        if (currentStatus == null || targetStatus == null) return false;
        
        if ("PROBATION".equals(currentStatus) && "ACTIVE".equals(targetStatus)) return true;
        if ("ACTIVE".equals(currentStatus) && "SUSPENDED".equals(targetStatus)) return true;
        if ("ACTIVE".equals(currentStatus) && "TERMINATED".equals(targetStatus)) return true;
        return false;
    }

    @Test
    public void isValidTransition_shouldAcceptValidTransitions() {
        assertTrue(isValidTransition("PROBATION", "ACTIVE"));
        assertTrue(isValidTransition("ACTIVE", "TERMINATED"));
    }

    @Test
    public void isValidTransition_shouldRejectInvalidTransitions() {
        assertFalse(isValidTransition("TERMINATED", "ACTIVE"));
        assertFalse(isValidTransition("SUSPENDED", "PROBATION"));
    }
}
