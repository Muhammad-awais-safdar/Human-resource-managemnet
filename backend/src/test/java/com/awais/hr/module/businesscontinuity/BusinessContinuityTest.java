package com.awais.hr.module.businesscontinuity;

import com.awais.hr.module.businesscontinuity.service.BusinessContinuityService;
import com.awais.hr.module.businesscontinuity.service.BusinessContinuityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class BusinessContinuityTest {

    @Mock
    private DataSource dataSource;

    private BusinessContinuityService bcService;

    @BeforeEach
    public void setUp() {
        bcService = new BusinessContinuityServiceImpl(dataSource);
    }

    @Test
    public void triggerBackup_shouldThrowException_whenBackupNameIsBlank() {
        Map<String, Object> body = Map.of("backupName", " ");
        assertThrows(IllegalArgumentException.class, () -> bcService.triggerBackup(body));
    }
}
