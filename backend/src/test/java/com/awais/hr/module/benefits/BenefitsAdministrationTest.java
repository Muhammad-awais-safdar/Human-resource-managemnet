package com.awais.hr.module.benefits;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.math.RoundingMode;
import static org.junit.jupiter.api.Assertions.*;

public class BenefitsAdministrationTest {

    private BigDecimal calculateEmployeeContribution(BigDecimal cost, BigDecimal employerPct) {
        BigDecimal employerShare = cost.multiply(employerPct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        return cost.subtract(employerShare).setScale(2, RoundingMode.HALF_UP);
    }

    @Test
    public void testContributionSplit() {
        // Total cost 150, employer pays 80% -> employee pays 30
        assertEquals(new BigDecimal("30.00"), calculateEmployeeContribution(new BigDecimal("150.00"), new BigDecimal("80.00")));
        
        // Total cost 200, employer pays 100% -> employee pays 0
        assertEquals(new BigDecimal("0.00"), calculateEmployeeContribution(new BigDecimal("200.00"), new BigDecimal("100.00")));
        
        // Total cost 100, employer pays 0% -> employee pays 100
        assertEquals(new BigDecimal("100.00"), calculateEmployeeContribution(new BigDecimal("100.00"), BigDecimal.ZERO));
    }
}
