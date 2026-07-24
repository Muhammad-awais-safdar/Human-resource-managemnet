package com.awais.hr.module.platformoperations;

import com.awais.hr.module.platformoperations.service.PlatformOperationsService;
import com.awais.hr.module.platformoperations.service.PlatformOperationsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class PlatformOperationsTest {

    @Mock
    private DataSource dataSource;

    private PlatformOperationsService opsService;

    @BeforeEach
    public void setUp() {
        opsService = new PlatformOperationsServiceImpl(dataSource);
    }

    @Test
    public void recordLog_shouldThrowException_whenOperationNameIsBlank() {
        Map<String, Object> body = Map.of("operationName", " ");
        assertThrows(IllegalArgumentException.class, () -> opsService.recordLog(body));
    }
}
