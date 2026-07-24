package com.awais.hr.module.enterpriseadmin;

import com.awais.hr.module.enterpriseadmin.service.EnterpriseAdminService;
import com.awais.hr.module.enterpriseadmin.service.EnterpriseAdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class EnterpriseAdminTest {

    @Mock
    private DataSource dataSource;

    private EnterpriseAdminService adminService;

    @BeforeEach
    public void setUp() {
        adminService = new EnterpriseAdminServiceImpl(dataSource);
    }

    @Test
    public void updateAdminSettings_shouldThrowException_whenLicenseTypeIsBlank() {
        Map<String, Object> body = Map.of("licenseType", " ");
        assertThrows(IllegalArgumentException.class, () -> adminService.updateAdminSettings(body));
    }
}
