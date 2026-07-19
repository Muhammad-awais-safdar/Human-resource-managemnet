package com.awais.hr.module.settings;

import com.awais.hr.module.settings.service.PlatformSettingsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

public class PlatformSettingsServiceImplTest {

    @Mock private DataSource dataSource;
    private PlatformSettingsServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PlatformSettingsServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testUpdateSettings_null_throwsException() {
        assertThrows(NullPointerException.class, () ->
                service.updateSettings(null)
        );
    }
}
