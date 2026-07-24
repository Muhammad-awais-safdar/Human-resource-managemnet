package com.awais.hr.module.sso;

import com.awais.hr.module.sso.service.SsoService;
import com.awais.hr.module.sso.service.SsoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class SsoTest {

    @Mock
    private DataSource dataSource;

    private SsoService ssoService;

    @BeforeEach
    public void setUp() {
        ssoService = new SsoServiceImpl(dataSource);
    }

    @Test
    public void updateSsoConfig_shouldThrowException_whenSsoUrlIsBlank() {
        Map<String, Object> body = Map.of("ssoUrl", " ");
        assertThrows(IllegalArgumentException.class, () -> ssoService.updateSsoConfig(body));
    }
}
