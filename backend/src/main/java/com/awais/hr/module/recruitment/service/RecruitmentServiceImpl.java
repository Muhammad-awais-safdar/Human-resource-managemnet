package com.awais.hr.module.recruitment.service;

import com.awais.hr.module.auditcenter.Auditable;
import com.awais.hr.module.makerchecker.service.MakerCheckerService;
import com.awais.hr.module.recruitment.dto.CandidateStageUpdateDTO;
import com.awais.hr.module.recruitment.dto.JobRequisitionRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class RecruitmentServiceImpl implements RecruitmentService {

    private static final Logger log = LoggerFactory.getLogger(RecruitmentServiceImpl.class);

    private static final Set<String> VALID_ATS_STAGES = Set.of(
            "APPLIED", "SCREENING", "INTERVIEW_SCHEDULED", "TECHNICAL_EVALUATION", "OFFER_EXTENDED", "HIRED", "REJECTED", "WITHDRAWN"
    );

    private final DataSource dataSource;
    private final ResumeParserService resumeParserService;
    private final MakerCheckerService makerCheckerService;

    public RecruitmentServiceImpl(DataSource dataSource, ResumeParserService resumeParserService, MakerCheckerService makerCheckerService) {
        this.dataSource = dataSource;
        this.resumeParserService = resumeParserService;
        this.makerCheckerService = makerCheckerService;
    }

    private boolean isSuperAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        return jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND r.name = 'SUPER_ADMIN')",
                Boolean.class, employeeId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getJobs() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, title, description, status, openings, salary_range, created_by, approved_by FROM job_requisition ORDER BY id DESC"
        );
    }

    @Override
    public void createJob(JobRequisitionRequestDTO dto) {
        createJobRequisition(dto, "system.recruiter@ep-systems.com");
    }

    @Override
    @Auditable(action = "REQUISITION_CREATE", entity = "JobRequisition")
    public void createJobRequisition(JobRequisitionRequestDTO dto, String creatorEmail) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Job title is required.");
        }
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String jobId = UUID.randomUUID().toString();
        int op = dto.getOpenings() != null ? dto.getOpenings() : 1;

        jdbcTemplate.update(
                "INSERT INTO job_requisition (id, title, description, status, openings, salary_range, created_by) " +
                        "VALUES (?, ?, ?, 'PENDING_APPROVAL', ?, ?, ?)",
                jobId, dto.getTitle(), dto.getDescription(), op, dto.getSalaryRange(), creatorEmail
        );

        makerCheckerService.submitRequest(
                "JOB_REQUISITION", "JobRequisition", jobId,
                Map.of("title", dto.getTitle(), "openings", op, "salaryRange", dto.getSalaryRange() != null ? dto.getSalaryRange() : ""),
                creatorEmail
        );

        log.info("Job requisition created: jobId={} title={} createdBy={}", jobId, dto.getTitle(), creatorEmail);
    }

    @Override
    @Auditable(action = "REQUISITION_APPROVE", entity = "JobRequisition")
    public void approveJobRequisition(String requisitionId, String approverEmail) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        Map<String, Object> req = jdbc.queryForMap("SELECT created_by, status FROM job_requisition WHERE id = ?", requisitionId);
        String creatorEmail = (String) req.get("created_by");

        // 1. Enforce Maker-Checker Dual Control (Maker != Checker)
        if (creatorEmail != null && creatorEmail.equalsIgnoreCase(approverEmail)) {
            throw new IllegalArgumentException("Maker-Checker Violation: Requisition creator cannot approve their own job opening.");
        }

        jdbc.update(
                "UPDATE job_requisition SET status = 'PUBLISHED', approved_by = ? WHERE id = ?",
                approverEmail, requisitionId
        );

        log.info("Job requisition approved & published: requisitionId={} approvedBy={}", requisitionId, approverEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCandidates(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);

        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.extracted_skills, c.extracted_experience, c.resume_url, c.status_stage, c.applied_at, c.deleted, " +
                            "j.title as job_title " +
                            "FROM candidate_application c " +
                            "JOIN job_requisition j ON c.job_id = j.id " +
                            "ORDER BY c.applied_at DESC"
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.extracted_skills, c.extracted_experience, c.resume_url, c.status_stage, c.applied_at, " +
                            "j.title as job_title " +
                            "FROM candidate_application c " +
                            "JOIN job_requisition j ON c.job_id = j.id " +
                            "WHERE c.deleted = FALSE " +
                            "ORDER BY c.applied_at DESC"
            );
        }
    }

    @Override
    public void updateCandidateStage(String id, CandidateStageUpdateDTO dto) {
        updateCandidateStageWithLog(id, dto.getStage(), "Stage updated via standard API", "system.recruiter@ep-systems.com");
    }

    @Override
    @Auditable(action = "CANDIDATE_STAGE_UPDATE", entity = "CandidateApplication")
    public void updateCandidateStageWithLog(String candidateId, String newStage, String comment, String actorEmail) {
        String targetStage = newStage.toUpperCase().trim();
        if (!VALID_ATS_STAGES.contains(targetStage)) {
            throw new IllegalArgumentException("Invalid ATS candidate stage: " + newStage);
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Map<String, Object> candidate = jdbc.queryForMap(
                "SELECT first_name, last_name, email, status_stage FROM candidate_application WHERE id = ?", candidateId
        );

        String currentStage = (String) candidate.get("status_stage");
        String firstName = (String) candidate.get("first_name");
        String lastName = (String) candidate.get("last_name");
        String email = (String) candidate.get("email");

        jdbc.update("UPDATE candidate_application SET status_stage = ? WHERE id = ?", targetStage, candidateId);

        jdbc.update(
                "INSERT INTO candidate_stage_log (id, candidate_id, previous_stage, new_stage, actor_email, comment) " +
                        "VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), candidateId, currentStage, targetStage, actorEmail, comment != null ? comment : "Moved to " + targetStage
        );

        // Transition to HIRED automatically provisions employee in Lifecycle Engine
        if ("HIRED".equals(targetStage)) {
            provisionHiredEmployee(jdbc, firstName, lastName, email, actorEmail);
        }

        log.info("Candidate ATS stage updated: candidateId={} from={} to={} actor={}", candidateId, currentStage, targetStage, actorEmail);
    }

    private void provisionHiredEmployee(JdbcTemplate jdbc, String firstName, String lastName, String email, String actorEmail) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM employee WHERE email = ?", Integer.class, email);

        String empId;
        if (count == null || count == 0) {
            empId = UUID.randomUUID().toString();
            jdbc.update(
                    "INSERT INTO employee (id, first_name, last_name, email, status, hire_date) VALUES (?, ?, ?, ?, 'PROBATION', CURRENT_DATE)",
                    empId, firstName, lastName, email
            );
        } else {
            empId = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
            jdbc.update("UPDATE employee SET status = 'PROBATION' WHERE id = ?", empId);
        }

        jdbc.update(
                "INSERT INTO employee_lifecycle_event (id, employee_id, previous_status, new_status, reason, created_by) " +
                        "VALUES (?, ?, 'APPLICANT', 'PROBATION', 'Hired from ATS Recruitment Pipeline', ?)",
                UUID.randomUUID().toString(), empId, actorEmail
        );

        log.info("Hired ATS candidate provisioned into Employee Lifecycle: empId={} email={}", empId, email);
    }

    @Override
    public void deleteCandidate(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE candidate_application SET deleted = TRUE WHERE id = ?", id);
    }

    @Override
    @Auditable(action = "CANDIDATE_APPLY", entity = "CandidateApplication")
    public void applyToJob(Map<String, String> application) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        String jobId = application.get("jobId");
        String firstName = application.get("firstName");
        String lastName = application.get("lastName");
        String email = application.get("email");
        String resumeUrl = application.get("resumeUrl");
        String resumeText = application.get("resumeText");

        Map<String, String> parsed = resumeParserService.parseResume(resumeText);
        String phone = parsed.get("phone");
        String skills = parsed.get("skills");
        String experience = parsed.get("experience");

        jdbcTemplate.update(
                "INSERT INTO candidate_application (id, job_id, first_name, last_name, email, phone, extracted_skills, extracted_experience, resume_url, status_stage) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPLIED')",
                id, jobId, firstName, lastName, email, phone, skills, experience, resumeUrl
        );

        jdbcTemplate.update(
                "INSERT INTO candidate_stage_log (id, candidate_id, previous_stage, new_stage, actor_email, comment) " +
                        "VALUES (?, ?, 'NONE', 'APPLIED', ?, 'Initial application submitted')",
                UUID.randomUUID().toString(), id, email
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCandidateLogs(String candidateId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, previous_stage, new_stage, actor_email, comment, created_at " +
                        "FROM candidate_stage_log WHERE candidate_id = ? ORDER BY created_at ASC",
                candidateId
        );
    }
}
