package com.awais.hr.module.career;

import com.awais.hr.module.career.service.CareerDevelopmentService;
import com.awais.hr.module.career.service.CareerDevelopmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class CareerDevelopmentTest {

    @Mock
    private DataSource dataSource;

    private CareerDevelopmentService careerService;

    @BeforeEach
    public void setUp() {
        careerService = new CareerDevelopmentServiceImpl(dataSource);
    }

    @Test
    public void createCareerPath_shouldThrowException_whenTitleIsBlank() {
        Map<String, Object> body = Map.of("title", " ");
        assertThrows(IllegalArgumentException.class, () -> careerService.createCareerPath(body));
    }

    @Test
    public void createMentorshipPair_shouldThrowException_whenMentorOrMenteeMissing() {
        Map<String, Object> body = Map.of("mentorId", "m-1");
        assertThrows(IllegalArgumentException.class, () -> careerService.createMentorshipPair(body));
    }

    @Test
    public void createDevelopmentPlan_shouldThrowException_whenTargetRoleMissing() {
        Map<String, Object> body = Map.of("employeeId", "emp-1");
        assertThrows(IllegalArgumentException.class, () -> careerService.createDevelopmentPlan(body));
    }
}
