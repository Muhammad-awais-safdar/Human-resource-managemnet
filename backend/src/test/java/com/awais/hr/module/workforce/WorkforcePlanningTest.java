package com.awais.hr.module.workforce;

import com.awais.hr.module.workforce.service.WorkforcePlanningService;
import com.awais.hr.module.workforce.service.WorkforcePlanningServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkforcePlanningTest {

    @Mock
    private DataSource dataSource;

    private WorkforcePlanningService planningService;

    @BeforeEach
    public void setUp() {
        planningService = new WorkforcePlanningServiceImpl(dataSource);
    }

    @Test
    public void createPlan_shouldThrowException_whenTitleIsBlank() {
        Map<String, Object> body = Map.of("title", "   ");
        assertThrows(IllegalArgumentException.class, () -> planningService.createPlan(body));
    }

    @Test
    public void addPositionBudget_shouldThrowException_whenJobTitleIsBlank() {
        Map<String, Object> body = Map.of("jobTitle", "");
        assertThrows(IllegalArgumentException.class, () -> planningService.addPositionBudget("plan-123", body));
    }

    @Test
    public void createForecastScenario_shouldThrowException_whenScenarioNameIsBlank() {
        Map<String, Object> body = Map.of("scenarioName", "");
        assertThrows(IllegalArgumentException.class, () -> planningService.createForecastScenario("plan-123", body));
    }
}
