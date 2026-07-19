package com.awais.hr.module.mobile;

import com.awais.hr.module.mobile.service.MobileSyncServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

public class MobileSyncServiceImplTest {

    @Mock private DataSource dataSource;
    private MobileSyncServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new MobileSyncServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testRegisterDevice_nullToken_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.registerDevice("emp@test.com", null, "ANDROID", "1.0.0")
        );
        assertTrue(ex.getMessage().contains("Device token is required"));
    }

    @Test
    public void testRegisterDevice_blankToken_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.registerDevice("emp@test.com", "  ", "ANDROID", "1.0.0")
        );
        assertTrue(ex.getMessage().contains("Device token is required"));
    }

    @Test
    public void testRegisterDevice_nullPlatform_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.registerDevice("emp@test.com", "token-abc-123-xyz-456", null, "1.0.0")
        );
        assertTrue(ex.getMessage().contains("Platform"));
    }

    @Test
    public void testRegisterDevice_blankPlatform_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.registerDevice("emp@test.com", "token-abc-123-xyz-456", "  ", "1.0.0")
        );
        assertTrue(ex.getMessage().contains("Platform"));
    }

    @Test
    public void testPushDelta_nullToken_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.pushDelta(null, "{\"leaves\":[]}")
        );
        assertTrue(ex.getMessage().contains("Device token is required"));
    }

    @Test
    public void testPushDelta_nullDeltaJson_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.pushDelta("valid-device-token-1234", null)
        );
        assertTrue(ex.getMessage().contains("Sync delta JSON is required"));
    }

    @Test
    public void testPushDelta_blankDeltaJson_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.pushDelta("valid-device-token-1234", "  ")
        );
        assertTrue(ex.getMessage().contains("Sync delta JSON is required"));
    }
}
