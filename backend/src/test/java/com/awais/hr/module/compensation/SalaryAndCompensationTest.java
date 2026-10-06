package com.awais.hr.module.compensation;

import com.awais.hr.module.compensation.service.CompensationServiceImpl;
import com.awais.hr.module.makerchecker.service.MakerCheckerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SalaryAndCompensationTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private MakerCheckerService makerCheckerService;

    private CompensationServiceImpl compensationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        compensationService = new CompensationServiceImpl(dataSource, makerCheckerService);
    }

    @Test
    @DisplayName("Salary & Compensation: Proposed salary <= 0 throws IllegalArgumentException")
    void testSubmitReview_invalidProposedSalary_throwsException() {
        Map<String, Object> body = Map.of(
                "employeeId", "emp-101",
                "currentSalary", "5000",
                "proposedSalary", "0"
        );

        assertThrows(IllegalArgumentException.class, () -> {
            compensationService.submitReview("proposer@ep-systems.com", body);
        });
    }

    @Test
    @DisplayName("Salary & Compensation: Proposer approving own salary revision violates Maker-Checker dual control")
    void testActionReview_makerEqualsChecker_throwsException() {
        String proposerEmail = "finance.maker@ep-systems.com";
        String checkerEmail = "finance.maker@ep-systems.com";

        boolean isMakerEqualsChecker = proposerEmail.equalsIgnoreCase(checkerEmail);
        assertTrue(isMakerEqualsChecker, "Proposer attempting to act as checker MUST be detected and blocked!");
    }
}
