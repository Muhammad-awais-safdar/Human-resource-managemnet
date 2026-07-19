package com.awais.hr.module.compliance;

import com.awais.hr.module.compliance.service.ComplianceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

public class ComplianceServiceImplTest {

    @Mock private DataSource dataSource;
    private ComplianceServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new ComplianceServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testGetConsent_nullEmail_throwsException() {
        assertThrows(Exception.class, () ->
                service.getGdprConsent(null)
        );
    }

    @Test
    public void testSaveConsent_nullEmail_throwsException() {
        assertThrows(Exception.class, () ->
                service.saveGdprConsent(null, true)
        );
    }
}
