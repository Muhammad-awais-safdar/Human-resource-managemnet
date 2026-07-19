package com.awais.hr.module.leave;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class LeaveAccrualTest {

    private long calculateRequestedDays(String start, String end) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    private boolean isWithinAllowance(long requestedDays, int allowance) {
        return requestedDays > 0 && requestedDays <= allowance;
    }

    @Test
    public void calculateRequestedDays_shouldReturnCorrectLength() {
        assertEquals(5, calculateRequestedDays("2026-07-20", "2026-07-24"));
        assertEquals(1, calculateRequestedDays("2026-07-20", "2026-07-20"));
    }

    @Test
    public void isWithinAllowance_shouldAssertCorrectly() {
        assertTrue(isWithinAllowance(5, 10));
        assertFalse(isWithinAllowance(12, 10)); // Exceeds limit
        assertFalse(isWithinAllowance(-2, 10)); // Invalid duration
    }
}
