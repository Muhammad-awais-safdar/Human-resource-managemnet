package com.awais.hr.module.tenant.service;

import com.awais.hr.exception.TenantAlreadyExistsException;
import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.repository.TenantRepository;
import com.awais.hr.module.tenant.infrastructure.datasource.TenantRoutingDataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import javax.sql.DataSource;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TenantServiceTest {

    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private TenantRoutingDataSource routingDataSource;
    @Mock
    private DataSource masterDataSource;
    @Mock
    private PasswordEncoder passwordEncoder;

    private TenantService tenantService;

    @BeforeEach
    public void setUp() {
        tenantService = new TenantService(
                tenantRepository,
                routingDataSource,
                masterDataSource,
                passwordEncoder
        );
    }

    @Test
    public void registerNewTenant_shouldThrowException_whenSubdomainAlreadyExists() {
        Tenant existing = new Tenant();
        when(tenantRepository.findBySubdomain("awais")).thenReturn(Optional.of(existing));

        assertThrows(TenantAlreadyExistsException.class, () -> {
            tenantService.registerNewTenant("Awais Corp", "awais", "admin@awais.com");
        });
    }
}
