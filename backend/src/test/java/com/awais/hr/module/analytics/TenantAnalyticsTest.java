package com.awais.hr.module.analytics;

import com.awais.hr.module.analytics.service.TenantAnalyticsService;
import com.awais.hr.module.analytics.service.TenantAnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class TenantAnalyticsTest {

    @Mock
    private DataSource dataSource;

    private TenantAnalyticsService analyticsService;

    @BeforeEach
    public void setUp() {
        analyticsService = new TenantAnalyticsServiceImpl(dataSource);
    }

    @Test
    public void recordMetric_shouldThrowException_whenSubdomainIsBlank() {
        Map<String, Object> body = Map.of("tenantSubdomain", " ");
        assertThrows(IllegalArgumentException.class, () -> analyticsService.recordMetric(body));
    }
}
