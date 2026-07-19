package com.awais.hr.module.ai;

import com.awais.hr.module.ai.service.AiAutomationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

public class AiAutomationServiceImplTest {

    @Mock private DataSource dataSource;
    private AiAutomationServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new AiAutomationServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testEvaluateCandidateFit_nullId_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.evaluateCandidateFit(null)
        );
        assertNotNull(ex);
    }

    @Test
    public void testPredictAttritionRisk_nullId_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.predictAttritionRisk(null)
        );
        assertNotNull(ex);
    }
}
