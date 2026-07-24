package com.awais.hr.module.recruitmentext;

import com.awais.hr.module.recruitmentext.service.InterviewOfferService;
import com.awais.hr.module.recruitmentext.service.InterviewOfferServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class InterviewOfferTest {

    @Mock
    private DataSource dataSource;

    private InterviewOfferService interviewOfferService;

    @BeforeEach
    public void setUp() {
        interviewOfferService = new InterviewOfferServiceImpl(dataSource);
    }

    @Test
    public void scheduleInterview_shouldThrowException_whenCandidateIsBlank() {
        Map<String, Object> body = Map.of("candidateName", " ", "interviewerEmail", "test@lead.com");
        assertThrows(IllegalArgumentException.class, () -> interviewOfferService.scheduleInterview(body));
    }
}
