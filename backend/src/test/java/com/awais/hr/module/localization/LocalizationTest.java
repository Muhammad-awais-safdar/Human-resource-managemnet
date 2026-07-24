package com.awais.hr.module.localization;

import com.awais.hr.module.localization.service.LocalizationService;
import com.awais.hr.module.localization.service.LocalizationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class LocalizationTest {

    @Mock
    private DataSource dataSource;

    private LocalizationService localizationService;

    @BeforeEach
    public void setUp() {
        localizationService = new LocalizationServiceImpl(dataSource);
    }

    @Test
    public void updateLocaleSettings_shouldThrowException_whenLanguageIsBlank() {
        Map<String, Object> body = Map.of("defaultLanguage", " ");
        assertThrows(IllegalArgumentException.class, () -> localizationService.updateLocaleSettings(body));
    }
}
