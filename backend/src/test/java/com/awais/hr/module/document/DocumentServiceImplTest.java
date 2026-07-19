package com.awais.hr.module.document;

import com.awais.hr.module.document.service.DocumentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import javax.sql.DataSource;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class DocumentServiceImplTest {

    @Mock private DataSource dataSource;
    private DocumentServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new DocumentServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }
}
