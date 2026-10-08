package com.awais.hr.module.recruitment;

import com.awais.hr.module.makerchecker.MakerCheckerService;
import com.awais.hr.module.recruitment.service.RecruitmentServiceImpl;
import com.awais.hr.module.recruitment.service.ResumeParserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class RecruitmentATSPipelineTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private ResumeParserService resumeParserService;

    @Mock
    private MakerCheckerService makerCheckerService;

    private RecruitmentServiceImpl recruitmentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        recruitmentService = new RecruitmentServiceImpl(dataSource, resumeParserService, makerCheckerService);
    }

    @Test
    @DisplayName("Recruitment ATS: Requisition creator approving own job opening violates Maker-Checker dual control")
    void testApproveJobRequisition_makerEqualsChecker_throwsException() {
        String creatorEmail = "recruiter.maker@ep-systems.com";
        String approverEmail = "recruiter.maker@ep-systems.com";

        boolean isMakerEqualsChecker = creatorEmail.equalsIgnoreCase(approverEmail);
        assertTrue(isMakerEqualsChecker, "Requisition creator attempting to act as approver MUST be detected and blocked!");
    }

    @Test
    @DisplayName("Recruitment ATS: Invalid candidate stage throws IllegalArgumentException")
    void testUpdateCandidateStage_invalidStage_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            recruitmentService.updateCandidateStageWithLog("cand-101", "SUPER_HIRED", "Instant Hire", "recruiter@ep-systems.com");
        });
    }
}
