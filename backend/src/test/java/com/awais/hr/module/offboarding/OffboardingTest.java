package com.awais.hr.module.offboarding;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class OffboardingTest {

    private double calculateSettlement(double basic, double allowance, double deductions) {
        return basic + allowance - deductions;
    }

    @Test
    public void calculateSettlement_shouldSumSalaryAndSubtractDeductions() {
        double result = calculateSettlement(4500.00, 500.00, 200.00);
        assertEquals(4800.00, result, 0.001);
    }

    @Test
    public void calculateSettlement_shouldHandleZeroAllowances() {
        double result = calculateSettlement(3000.00, 0.00, 100.00);
        assertEquals(2900.00, result, 0.001);
    }
}
