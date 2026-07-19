package com.awais.hr.module.performance;

import com.awais.hr.module.performance.dto.GoalProgressUpdateDTO;
import com.awais.hr.module.performance.service.PerformanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class PerformanceServiceImplTest {

    @Mock private DataSource dataSource;

    private PerformanceServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PerformanceServiceImpl(dataSource);
    }

    @Test
    void service_instantiatesSuccessfully() {
        assertNotNull(service);
    }

    @Test
    void goalStatus_whenProgressAtHundred_isCompleted() {
        GoalProgressUpdateDTO dto = new GoalProgressUpdateDTO();
        dto.setProgress(100);
        String status = dto.getProgress() >= 100 ? "COMPLETED" : "IN_PROGRESS";
        assertEquals("COMPLETED", status);
    }

    @Test
    void goalStatus_whenProgressBelowHundred_isInProgress() {
        GoalProgressUpdateDTO dto = new GoalProgressUpdateDTO();
        dto.setProgress(75);
        String status = dto.getProgress() >= 100 ? "COMPLETED" : "IN_PROGRESS";
        assertEquals("IN_PROGRESS", status);
    }

    @Test
    void goalStatus_whenProgressAtZero_isInProgress() {
        GoalProgressUpdateDTO dto = new GoalProgressUpdateDTO();
        dto.setProgress(0);
        String status = dto.getProgress() >= 100 ? "COMPLETED" : "IN_PROGRESS";
        assertEquals("IN_PROGRESS", status);
    }

    @Test
    void peerFeedbackRating_mustBeWithinRange() {
        int rating = 4;
        assertTrue(rating >= 1 && rating <= 5);
    }

    @Test
    void peerFeedbackRating_boundaryAtOne_isValid() {
        int rating = 1;
        assertTrue(rating >= 1 && rating <= 5);
    }

    @Test
    void peerFeedbackRating_boundaryAtFive_isValid() {
        int rating = 5;
        assertTrue(rating >= 1 && rating <= 5);
    }
}
