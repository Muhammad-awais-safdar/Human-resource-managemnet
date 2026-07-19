package com.awais.hr.module.attendance;

import com.awais.hr.module.attendance.service.GeofenceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import javax.sql.DataSource;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class GeofenceServiceTest {

    @Mock private DataSource dataSource;
    private GeofenceServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new GeofenceServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }
}
