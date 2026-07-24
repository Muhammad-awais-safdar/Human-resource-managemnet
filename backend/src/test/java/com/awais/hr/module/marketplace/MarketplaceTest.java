package com.awais.hr.module.marketplace;

import com.awais.hr.module.marketplace.service.MarketplaceService;
import com.awais.hr.module.marketplace.service.MarketplaceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class MarketplaceTest {

    @Mock
    private DataSource dataSource;

    private MarketplaceService marketplaceService;

    @BeforeEach
    public void setUp() {
        marketplaceService = new MarketplaceServiceImpl(dataSource);
    }

    @Test
    public void installPlugin_shouldThrowException_whenPluginNameIsBlank() {
        Map<String, Object> body = Map.of("pluginName", " ");
        assertThrows(IllegalArgumentException.class, () -> marketplaceService.installPlugin(body));
    }
}
