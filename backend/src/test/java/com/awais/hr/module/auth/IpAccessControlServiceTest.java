package com.awais.hr.module.auth;

import com.awais.hr.module.auth.service.IpAccessControlServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import javax.sql.DataSource;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class IpAccessControlServiceTest {

    @Mock private DataSource dataSource;
    private IpAccessControlServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new IpAccessControlServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }
}
