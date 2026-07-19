package com.awais.hr.module.enterprise;

import com.awais.hr.module.enterprise.service.EnterpriseFeaturesServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

public class EnterpriseFeaturesServiceImplTest {

    @Mock private DataSource dataSource;
    private EnterpriseFeaturesServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new EnterpriseFeaturesServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testGenerateKey_nullName_throwsException() {
        assertThrows(Exception.class, () ->
                service.generateApiKey("admin@test.com", null)
        );
    }

    @Test
    public void testValidateKey_invalidFormatReturnsFalse() {
        assertFalse(service.validateApiKey("invalid-prefix-123"));
        assertFalse(service.validateApiKey(null));
    }
}
