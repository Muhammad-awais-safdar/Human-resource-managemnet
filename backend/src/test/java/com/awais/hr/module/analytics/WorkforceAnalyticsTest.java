package com.awais.hr.module.analytics;

import com.awais.hr.module.analytics.service.WorkforceAnalyticsService;
import com.awais.hr.module.analytics.service.WorkforceAnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class WorkforceAnalyticsTest {

    @Mock
    private DataSource dataSource;

    private WorkforceAnalyticsService analyticsService;

    @BeforeEach
    public void setUp() {
        analyticsService = new WorkforceAnalyticsServiceImpl(dataSource);
    }

    @Test
    public void recordMetricSnapshot_shouldThrowException_whenKeyIsBlank() {
        Map<String, Object> body = Map.of("metricKey", " ");
        assertThrows(IllegalArgumentException.class, () -> analyticsService.recordMetricSnapshot(body));
    }

    @Test
    public void recordAttritionTrend_shouldThrowException_whenPeriodIsBlank() {
        Map<String, Object> body = Map.of("periodYearMonth", "");
        assertThrows(IllegalArgumentException.class, () -> analyticsService.recordAttritionTrend(body));
    }
}
