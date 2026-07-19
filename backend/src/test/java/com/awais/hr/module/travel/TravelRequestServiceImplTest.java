package com.awais.hr.module.travel;

import com.awais.hr.module.travel.service.TravelRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import javax.sql.DataSource;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class TravelRequestServiceImplTest {

    @Mock private DataSource dataSource;
    private TravelRequestServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new TravelRequestServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }
}
