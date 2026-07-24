package com.awais.hr.module.engagement;

import com.awais.hr.module.engagement.service.EngagementService;
import com.awais.hr.module.engagement.service.EngagementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeEngagementTest {

    @Mock
    private DataSource dataSource;

    private EngagementService engagementService;

    @BeforeEach
    public void setUp() {
        engagementService = new EngagementServiceImpl(dataSource);
    }

    @Test
    public void createSurvey_shouldThrowException_whenTitleIsBlank() {
        Map<String, Object> body = Map.of("title", "");
        assertThrows(IllegalArgumentException.class, () -> engagementService.createSurvey(body));
    }

    @Test
    public void sendRecognition_shouldThrowException_whenReceiverIdIsBlank() {
        Map<String, Object> body = Map.of("receiverId", " ");
        assertThrows(IllegalArgumentException.class, () -> engagementService.sendRecognition("user@company.com", body));
    }

    @Test
    public void submitSuggestion_shouldThrowException_whenTextIsBlank() {
        Map<String, Object> body = Map.of("suggestionText", "");
        assertThrows(IllegalArgumentException.class, () -> engagementService.submitSuggestion(body));
    }
}
