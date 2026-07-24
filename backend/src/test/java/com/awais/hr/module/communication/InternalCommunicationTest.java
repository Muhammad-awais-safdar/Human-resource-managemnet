package com.awais.hr.module.communication;

import com.awais.hr.module.communication.service.InternalCommunicationService;
import com.awais.hr.module.communication.service.InternalCommunicationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class InternalCommunicationTest {

    @Mock
    private DataSource dataSource;

    private InternalCommunicationService communicationService;

    @BeforeEach
    public void setUp() {
        communicationService = new InternalCommunicationServiceImpl(dataSource);
    }

    @Test
    public void createFeedPost_shouldThrowException_whenTitleOrContentIsBlank() {
        Map<String, Object> body = Map.of("title", " ", "content", "valid content");
        assertThrows(IllegalArgumentException.class, () -> communicationService.createFeedPost(body));
    }

    @Test
    public void createPoll_shouldThrowException_whenQuestionIsBlank() {
        Map<String, Object> body = Map.of("question", "");
        assertThrows(IllegalArgumentException.class, () -> communicationService.createPoll(body));
    }
}
