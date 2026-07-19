package com.awais.hr.module.integration;

import com.awais.hr.module.integration.service.IntegrationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

public class IntegrationServiceImplTest {

    @Mock private DataSource dataSource;
    private IntegrationServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new IntegrationServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testUpsertIntegration_nullProvider_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.upsertIntegration(null, "client-id", "client-secret", "{}")
        );
        assertTrue(ex.getMessage().contains("Provider is required"));
    }

    @Test
    public void testUpsertIntegration_blankProvider_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.upsertIntegration("   ", "client-id", "client-secret", "{}")
        );
        assertTrue(ex.getMessage().contains("Provider is required"));
    }

    @Test
    public void testAddWebhook_nullUrl_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.addWebhook(null, "description", "secret", "[\"LEAVE_APPROVED\"]")
        );
        assertTrue(ex.getMessage().contains("Target URL is required"));
    }

    @Test
    public void testAddWebhook_httpUrl_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.addWebhook("http://insecure.example.com/hook", "description", "secret", "[\"LEAVE_APPROVED\"]")
        );
        assertTrue(ex.getMessage().contains("HTTPS"));
    }

    @Test
    public void testAddWebhook_nullEvents_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.addWebhook("https://secure.example.com/hook", "description", "secret", null)
        );
        assertTrue(ex.getMessage().contains("Events JSON is required"));
    }

    @Test
    public void testAddWebhook_blankEvents_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.addWebhook("https://secure.example.com/hook", "description", "secret", "  ")
        );
        assertTrue(ex.getMessage().contains("Events JSON is required"));
    }
}
