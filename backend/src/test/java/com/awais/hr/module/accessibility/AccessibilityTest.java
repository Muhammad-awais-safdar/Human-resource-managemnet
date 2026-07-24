package com.awais.hr.module.accessibility;

import com.awais.hr.module.accessibility.service.AccessibilityService;
import com.awais.hr.module.accessibility.service.AccessibilityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class AccessibilityTest {

    @Mock
    private DataSource dataSource;

    private AccessibilityService accessibilityService;

    @BeforeEach
    public void setUp() {
        accessibilityService = new AccessibilityServiceImpl(dataSource);
    }

    @Test
    public void updatePreferences_shouldThrowException_whenFontScaleOutOfRange() {
        Map<String, Object> body = Map.of("fontScalePercent", 300);
        assertThrows(IllegalArgumentException.class, () -> accessibilityService.updatePreferences(body));
    }
}
