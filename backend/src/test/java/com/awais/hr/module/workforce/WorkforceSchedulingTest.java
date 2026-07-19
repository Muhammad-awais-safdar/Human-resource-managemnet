package com.awais.hr.module.workforce;

import org.junit.jupiter.api.Test;
import java.time.LocalTime;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

public class WorkforceSchedulingTest {

    private long calculateShiftDurationHours(String start, String end) {
        LocalTime startTime = LocalTime.parse(start);
        LocalTime endTime = LocalTime.parse(end);
        if (endTime.isBefore(startTime)) {
            // crosses midnight
            return 24 - Duration.between(endTime, startTime).toHours();
        }
        return Duration.between(startTime, endTime).toHours();
    }

    private boolean hasOverlap(String s1Start, String s1End, String s2Start, String s2End) {
        LocalTime start1 = LocalTime.parse(s1Start);
        LocalTime end1 = LocalTime.parse(s1End);
        LocalTime start2 = LocalTime.parse(s2Start);
        LocalTime end2 = LocalTime.parse(s2End);

        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    @Test
    public void testShiftDuration() {
        assertEquals(8, calculateShiftDurationHours("09:00", "17:00"));
        assertEquals(8, calculateShiftDurationHours("22:00", "06:00")); // across midnight
    }

    @Test
    public void testOverlapConflictDetection() {
        assertTrue(hasOverlap("09:00", "17:00", "12:00", "20:00"));
        assertFalse(hasOverlap("09:00", "17:00", "17:00", "23:00"));
    }
}
