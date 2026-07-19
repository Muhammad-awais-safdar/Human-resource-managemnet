package com.awais.hr.module.communication;

import com.awais.hr.module.communication.service.CommunicationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

public class CommunicationServiceImplTest {

    @Mock private DataSource dataSource;
    private CommunicationServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new CommunicationServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testPostAnnouncement_nullTitle_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.postAnnouncement("admin@test.com", null, "Content", "ALL", null)
        );
        assertTrue(ex.getMessage().contains("title is required"));
    }

    @Test
    public void testPostAnnouncement_blankTitle_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.postAnnouncement("admin@test.com", "  ", "Content", "ALL", null)
        );
        assertTrue(ex.getMessage().contains("title is required"));
    }

    @Test
    public void testPostAnnouncement_nullContent_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.postAnnouncement("admin@test.com", "Title", null, "ALL", null)
        );
        assertTrue(ex.getMessage().contains("content is required"));
    }

    @Test
    public void testSendNotification_nullTitle_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.sendNotification("emp-uuid-123", null, "Message", "GENERAL")
        );
        assertTrue(ex.getMessage().contains("title is required"));
    }

    @Test
    public void testSendNotification_nullMessage_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.sendNotification("emp-uuid-123", "Title", null, "GENERAL")
        );
        assertTrue(ex.getMessage().contains("message is required"));
    }
}
