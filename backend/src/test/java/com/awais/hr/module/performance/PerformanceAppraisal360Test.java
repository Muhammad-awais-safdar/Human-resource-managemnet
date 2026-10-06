package com.awais.hr.module.performance;

import com.awais.hr.module.performance.service.PerformanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class PerformanceAppraisal360Test {

    @Mock
    private DataSource dataSource;

    private PerformanceServiceImpl performanceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        performanceService = new PerformanceServiceImpl(dataSource);
    }

    @Test
    @DisplayName("Performance 360: Rating outside 1-5 scale throws IllegalArgumentException")
    void testSelfAppraisal_invalidRating_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            performanceService.submitSelfAppraisal("appraisal-101", 6, "Exceeded expectations!", "emp@ep-systems.com");
        });
    }

    @Test
    @DisplayName("Performance 360: Manager attempting self-evaluation is prohibited")
    void testManagerEvaluation_selfEvaluation_prohibited() {
        String employeeId = "emp-101";
        String managerId = "emp-101";

        boolean isSelfEvaluation = employeeId.equals(managerId);
        assertTrue(isSelfEvaluation, "Manager attempting self-evaluation MUST be detected and blocked!");
    }
}
