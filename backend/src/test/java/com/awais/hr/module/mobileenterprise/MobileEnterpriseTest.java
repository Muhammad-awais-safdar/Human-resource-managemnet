package com.awais.hr.module.mobileenterprise;

import com.awais.hr.module.mobileenterprise.service.MobileEnterpriseService;
import com.awais.hr.module.mobileenterprise.service.MobileEnterpriseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class MobileEnterpriseTest {

    @Mock
    private DataSource dataSource;

    private MobileEnterpriseService mobileService;

    @BeforeEach
    public void setUp() {
        mobileService = new MobileEnterpriseServiceImpl(dataSource);
    }

    @Test
    public void registerDevice_shouldThrowException_whenDeviceNameIsBlank() {
        Map<String, Object> body = Map.of("deviceName", " ");
        assertThrows(IllegalArgumentException.class, () -> mobileService.registerDevice(body));
    }
}
