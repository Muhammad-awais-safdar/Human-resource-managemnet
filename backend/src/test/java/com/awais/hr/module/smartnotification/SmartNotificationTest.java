package com.awais.hr.module.smartnotification;

import com.awais.hr.module.smartnotification.service.SmartNotificationService;
import com.awais.hr.module.smartnotification.service.SmartNotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class SmartNotificationTest {

    @Mock
    private DataSource dataSource;

    private SmartNotificationService notificationService;

    @BeforeEach
    public void setUp() {
        notificationService = new SmartNotificationServiceImpl(dataSource);
    }

    @Test
    public void updatePreferences_shouldThrowException_whenEmailIsBlank() {
        Map<String, Object> body = Map.of("userEmail", " ");
        assertThrows(IllegalArgumentException.class, () -> notificationService.updatePreferences(body));
    }
}
