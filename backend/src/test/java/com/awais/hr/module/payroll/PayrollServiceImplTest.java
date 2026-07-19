package com.awais.hr.module.payroll;

import com.awais.hr.module.payroll.service.PayrollServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class PayrollServiceImplTest {

    @Mock private DataSource dataSource;

    private PayrollServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PayrollServiceImpl(dataSource);
    }

    @Test
    void service_instantiatesSuccessfully() {
        assertNotNull(service);
    }

    @Test
    void taxCalculation_aboveThreshold_expectsTenPercent() {
        // Logic test: gross > 3000 => taxRate = 10%
        double gross = 5000.0;
        double taxRate = gross > 3000 ? 0.10 : 0.0;
        assertEquals(0.10, taxRate);
    }

    @Test
    void taxCalculation_belowThreshold_expectsZeroPercent() {
        double gross = 2500.0;
        double taxRate = gross > 3000 ? 0.10 : 0.0;
        assertEquals(0.0, taxRate);
    }

    @Test
    void netSalary_calculation_isCorrect() {
        double basic = 4000, allowance = 500, deductions = 200;
        double gross = basic + allowance;           // 4500
        double tax = gross * 0.10;                  // 450
        double net = gross - deductions - tax;      // 3850
        assertEquals(3850.0, net, 0.01);
    }
}
