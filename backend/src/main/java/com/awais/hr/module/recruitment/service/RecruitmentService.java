package com.awais.hr.module.recruitment.service;

import com.awais.hr.module.recruitment.dto.CandidateStageUpdateDTO;
import com.awais.hr.module.recruitment.dto.JobRequisitionRequestDTO;
import java.util.List;
import java.util.Map;

public interface RecruitmentService {
    List<Map<String, Object>> getJobs();
    void createJob(JobRequisitionRequestDTO dto);
    List<Map<String, Object>> getCandidates(String email);
    void updateCandidateStage(String id, CandidateStageUpdateDTO dto);
    void deleteCandidate(String id);
    void applyToJob(Map<String, String> application);
}
