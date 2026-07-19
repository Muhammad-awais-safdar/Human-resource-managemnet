package com.awais.hr.module.shift;

import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class ShiftTest {

    private final Set<String> rosterScheduleDb = new HashSet<>();

    private boolean tryScheduleShift(String employeeId, String date) {
        String key = employeeId + "|" + date;
        if (rosterScheduleDb.contains(key)) {
            return false; // Scheduling collision detected!
        }
        rosterScheduleDb.add(key);
        return true;
    }

    @Test
    public void tryScheduleShift_shouldAcceptNewDate() {
        assertTrue(tryScheduleShift("emp1", "2026-07-20"));
        assertTrue(tryScheduleShift("emp1", "2026-07-21"));
    }

    @Test
    public void tryScheduleShift_shouldRejectDoubleBooking() {
        assertTrue(tryScheduleShift("emp2", "2026-07-20"));
        assertFalse(tryScheduleShift("emp2", "2026-07-20")); // Duplicate booking
    }
}
