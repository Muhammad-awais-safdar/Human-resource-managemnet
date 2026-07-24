package com.awais.hr.module.aicopilot;

import com.awais.hr.module.aicopilot.service.AiCopilotService;
import com.awais.hr.module.aicopilot.service.AiCopilotServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class AiCopilotTest {

    @Mock
    private DataSource dataSource;

    private AiCopilotService copilotService;

    @BeforeEach
    public void setUp() {
        copilotService = new AiCopilotServiceImpl(dataSource);
    }

    @Test
    public void askCopilot_shouldThrowException_whenPromptIsBlank() {
        Map<String, Object> body = Map.of("prompt", " ");
        assertThrows(IllegalArgumentException.class, () -> copilotService.askCopilot(body));
    }
}
