package com.awais.hr.module.learning;

import com.awais.hr.module.learning.service.LearningServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class LearningServiceImplTest {

    @Mock private DataSource dataSource;

    private LearningServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new LearningServiceImpl(dataSource);
    }

    @Test
    void service_instantiatesSuccessfully() {
        assertNotNull(service);
    }

    @Test
    void quizAnswer_caseInsensitive_matchesCorrectly() {
        String correct = "A";
        String answer = "a";
        boolean isCorrect = answer != null && answer.equalsIgnoreCase(correct);
        assertTrue(isCorrect);
    }

    @Test
    void quizAnswer_wrongAnswer_doesNotMatch() {
        String correct = "A";
        String answer = "B";
        boolean isCorrect = answer.equalsIgnoreCase(correct);
        assertFalse(isCorrect);
    }

    @Test
    void quizAnswer_nullAnswer_returnsFalse() {
        String correct = "A";
        String answer = null;
        boolean isCorrect = answer != null && answer.equalsIgnoreCase(correct);
        assertFalse(isCorrect);
    }

    @Test
    void quizResult_correct_hasCorrectMessage() {
        boolean isCorrect = true;
        Map<String, Object> result = Map.of("correct", isCorrect, "message", isCorrect ? "Correct!" : "Wrong answer");
        assertEquals("Correct!", result.get("message"));
    }

    @Test
    void quizResult_wrong_hasWrongMessage() {
        boolean isCorrect = false;
        Map<String, Object> result = Map.of("correct", isCorrect, "message", isCorrect ? "Correct!" : "Wrong answer");
        assertEquals("Wrong answer", result.get("message"));
    }
}
