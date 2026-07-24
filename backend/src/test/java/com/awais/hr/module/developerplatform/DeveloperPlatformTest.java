package com.awais.hr.module.developerplatform;

import com.awais.hr.module.developerplatform.service.DeveloperPlatformService;
import com.awais.hr.module.developerplatform.service.DeveloperPlatformServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class DeveloperPlatformTest {

    @Mock
    private DataSource dataSource;

    private DeveloperPlatformService devService;

    @BeforeEach
    public void setUp() {
        devService = new DeveloperPlatformServiceImpl(dataSource);
    }

    @Test
    public void registerWebhook_shouldThrowException_whenEventTypeOrTargetUrlIsBlank() {
        Map<String, Object> body = Map.of("eventType", "employee.created", "targetUrl", " ");
        assertThrows(IllegalArgumentException.class, () -> devService.registerWebhook(body));
    }
}
