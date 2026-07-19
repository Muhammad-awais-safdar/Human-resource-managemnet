package com.awais.hr.module.succession;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SuccessionPlanningTest {

    private boolean isReadyForRole(int readinessScore, int timelineMonths) {
        return readinessScore >= 80 && timelineMonths <= 6;
    }

    @Test
    public void testReadinessRoleStatus() {
        assertTrue(isReadyForRole(85, 3));
        assertTrue(isReadyForRole(80, 6));
        assertFalse(isReadyForRole(75, 3)); // low readiness
        assertFalse(isReadyForRole(90, 12)); // long timeline
    }
}
