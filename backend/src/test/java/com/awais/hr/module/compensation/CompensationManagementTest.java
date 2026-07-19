package com.awais.hr.module.compensation;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.math.RoundingMode;
import static org.junit.jupiter.api.Assertions.*;

public class CompensationManagementTest {

    private BigDecimal calculateMeritPct(BigDecimal current, BigDecimal proposed) {
        if (current.compareTo(BigDecimal.ZERO) <= 0) return new BigDecimal("0.00");
        return proposed.subtract(current)
                .multiply(new BigDecimal("100"))
                .divide(current, 2, RoundingMode.HALF_UP);
    }

    private boolean isWithinSalaryBand(BigDecimal proposed, BigDecimal min, BigDecimal max) {
        return proposed.compareTo(min) >= 0 && proposed.compareTo(max) <= 0;
    }

    @Test
    public void testMeritPercentageCalculation() {
        assertEquals(new BigDecimal("10.00"), calculateMeritPct(new BigDecimal("1000"), new BigDecimal("1100")));
        assertEquals(new BigDecimal("0.00"), calculateMeritPct(BigDecimal.ZERO, new BigDecimal("1100")));
        assertEquals(new BigDecimal("-5.00"), calculateMeritPct(new BigDecimal("1000"), new BigDecimal("950")));
    }

    @Test
    public void testSalaryBandCompliance() {
        assertTrue(isWithinSalaryBand(new BigDecimal("3500"), new BigDecimal("3000"), new BigDecimal("5000")));
        assertFalse(isWithinSalaryBand(new BigDecimal("2500"), new BigDecimal("3000"), new BigDecimal("5000")));
        assertFalse(isWithinSalaryBand(new BigDecimal("5500"), new BigDecimal("3000"), new BigDecimal("5000")));
    }
}
