package com.awais.hr.module.recruitmentext.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class InterviewOfferServiceImpl implements InterviewOfferService {

    private static final Logger log = LoggerFactory.getLogger(InterviewOfferServiceImpl.class);
    private final DataSource dataSource;

    public InterviewOfferServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInterviews() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, candidate_name, interviewer_email, interview_date, round_name, meeting_link, status, created_at FROM interview_schedule ORDER BY created_at DESC");
        if (list.isEmpty()) {
            return List.of(
                    Map.of("candidateName", "John Doe", "interviewerEmail", "tech.lead@workforceos.com", "roundName", "TECHNICAL_ROUND_1", "meetingLink", "https://meet.google.com/xyz-abc-def", "status", "SCHEDULED")
            );
        }
        return list;
    }

    @Override
    public Map<String, Object> scheduleInterview(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String candidate = (String) body.get("candidateName");
        String interviewer = (String) body.get("interviewerEmail");
        if (candidate == null || candidate.isBlank() || interviewer == null || interviewer.isBlank()) {
            throw new IllegalArgumentException("Candidate name and interviewer email are required.");
        }
        String round = body.get("roundName") != null ? (String) body.get("roundName") : "TECHNICAL_ROUND_1";
        String link = body.get("meetingLink") != null ? (String) body.get("meetingLink") : "https://meet.google.com/demo-link";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO interview_schedule (id, candidate_name, interviewer_email, interview_date, round_name, meeting_link, status) VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')",
                id, candidate.trim(), interviewer.trim(), Timestamp.from(Instant.now().plusSeconds(86400)), round, link
        );
        log.info("Interview scheduled for candidate {} with {}", candidate, interviewer);
        return Map.of("id", id, "candidateName", candidate, "interviewerEmail", interviewer, "roundName", round, "meetingLink", link, "status", "SCHEDULED");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOffers() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, candidate_email, job_title, offered_salary, status, created_at FROM candidate_offer_letter ORDER BY created_at DESC");
        if (list.isEmpty()) {
            return List.of(
                    Map.of("candidateEmail", "jane.smith@example.com", "jobTitle", "Senior Backend Architect", "offeredSalary", 120000.00, "status", "SENT")
            );
        }
        return list;
    }

    @Override
    public Map<String, Object> createOffer(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String email = (String) body.get("candidateEmail");
        String title = (String) body.get("jobTitle");
        if (email == null || email.isBlank() || title == null || title.isBlank()) {
            throw new IllegalArgumentException("Candidate email and job title are required.");
        }
        BigDecimal salary = body.get("offeredSalary") != null ? BigDecimal.valueOf(((Number) body.get("offeredSalary")).doubleValue()) : BigDecimal.valueOf(90000);

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO candidate_offer_letter (id, candidate_email, job_title, offered_salary, status) VALUES (?, ?, ?, ?, 'PENDING_APPROVAL')", id, email.trim(), title.trim(), salary);
        log.info("Offer letter generated for candidate {}: salary=${}", email, salary);
        return Map.of("id", id, "candidateEmail", email, "jobTitle", title, "offeredSalary", salary, "status", "PENDING_APPROVAL");
    }
}
