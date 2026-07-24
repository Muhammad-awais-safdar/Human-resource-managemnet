package com.awais.hr.module.apimarketplace;

import com.awais.hr.module.apimarketplace.service.ApiMarketplaceService;
import com.awais.hr.module.apimarketplace.service.ApiMarketplaceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class ApiMarketplaceTest {

    @Mock
    private DataSource dataSource;

    private ApiMarketplaceService apiService;

    @BeforeEach
    public void setUp() {
        apiService = new ApiMarketplaceServiceImpl(dataSource);
    }

    @Test
    public void generateApiKey_shouldThrowException_whenKeyNameIsBlank() {
        Map<String, Object> body = Map.of("keyName", " ");
        assertThrows(IllegalArgumentException.class, () -> apiService.generateApiKey(body));
    }
}
