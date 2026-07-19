package com.awais.hr.module.recruitment.service;

import com.awais.hr.module.recruitment.dto.CandidateStageUpdateDTO;
import com.awais.hr.module.recruitment.dto.JobRequisitionRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class RecruitmentServiceImpl implements RecruitmentService {

    private final DataSource dataSource;
    private final ResumeParserService resumeParserService;

    public RecruitmentServiceImpl(DataSource dataSource, ResumeParserService resumeParserService) {
        this.dataSource = dataSource;
        this.resumeParserService = resumeParserService;
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
                "SELECT id, title, description, status, openings, salary_range FROM job_requisition"
        );
    }

    @Override
    public void createJob(JobRequisitionRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String jobId = UUID.randomUUID().toString();
        int op = dto.getOpenings() != null ? dto.getOpenings() : 1;
        jdbcTemplate.update(
                "INSERT INTO job_requisition (id, title, description, status, openings, salary_range) VALUES (?, ?, ?, 'OPEN', ?, ?)",
                jobId, dto.getTitle(), dto.getDescription(), op, dto.getSalaryRange()
        );
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
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update(
                "UPDATE candidate_application SET status_stage = ? WHERE id = ?",
                dto.getStage().toUpperCase().trim(), id
        );
    }

    @Override
    public void deleteCandidate(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE candidate_application SET deleted = TRUE WHERE id = ?", id);
    }

    @Override
    public void applyToJob(Map<String, String> application) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        String jobId = application.get("jobId");
        String firstName = application.get("firstName");
        String lastName = application.get("lastName");
        String email = application.get("email");
        String resumeUrl = application.get("resumeUrl");
        String resumeText = application.get("resumeText");

        // Parse resume using dynamic SOLID parser service (SRP)
        Map<String, String> parsed = resumeParserService.parseResume(resumeText);
        String phone = parsed.get("phone");
        String skills = parsed.get("skills");
        String experience = parsed.get("experience");

        jdbcTemplate.update(
                "INSERT INTO candidate_application (id, job_id, first_name, last_name, email, phone, extracted_skills, extracted_experience, resume_url, status_stage) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPLIED')",
                id, jobId, firstName, lastName, email, phone, skills, experience, resumeUrl
        );
    }
}
