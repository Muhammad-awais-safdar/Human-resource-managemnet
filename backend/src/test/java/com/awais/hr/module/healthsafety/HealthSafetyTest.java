package com.awais.hr.module.healthsafety;

import com.awais.hr.module.healthsafety.service.HealthSafetyService;
import com.awais.hr.module.healthsafety.service.HealthSafetyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class HealthSafetyTest {

    @Mock
    private DataSource dataSource;

    private HealthSafetyService healthSafetyService;

    @BeforeEach
    public void setUp() {
        healthSafetyService = new HealthSafetyServiceImpl(dataSource);
    }

    @Test
    public void reportIncident_shouldThrowException_whenTitleIsBlank() {
        Map<String, Object> body = Map.of("title", " ");
        assertThrows(IllegalArgumentException.class, () -> healthSafetyService.reportIncident(body));
    }

    @Test
    public void assignPpe_shouldThrowException_whenItemNameIsBlank() {
        Map<String, Object> body = Map.of("itemName", "", "employeeId", "emp-1");
        assertThrows(IllegalArgumentException.class, () -> healthSafetyService.assignPpe(body));
    }
}
