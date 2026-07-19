package com.awais.hr.module.contractor;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

public class ContractorManagementTest {

    private BigDecimal calculateWeeklyBilling(double hoursLogged, double hourlyRate) {
        if (hoursLogged < 0 || hourlyRate < 0) return new BigDecimal("0.00");
        return BigDecimal.valueOf(hoursLogged).multiply(BigDecimal.valueOf(hourlyRate)).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    @Test
    public void testWeeklyBillingCalculation() {
        assertEquals(new BigDecimal("1600.00"), calculateWeeklyBilling(40.0, 40.0));
        assertEquals(new BigDecimal("0.00"), calculateWeeklyBilling(0.0, 40.0));
        assertEquals(new BigDecimal("0.00"), calculateWeeklyBilling(-5.0, 40.0));
    }
}
