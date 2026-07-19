package com.awais.hr.module.recruitment.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.recruitment.dto.CandidateStageUpdateDTO;
import com.awais.hr.module.recruitment.dto.JobRequisitionRequestDTO;
import com.awais.hr.module.recruitment.service.RecruitmentService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/recruitment")
@CrossOrigin(origins = "*")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    public RecruitmentController(RecruitmentService recruitmentService) {
        this.recruitmentService = recruitmentService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/jobs")
    public ApiResponse<List<Map<String, Object>>> getJobs() {
        try {
            List<Map<String, Object>> result = recruitmentService.getJobs();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/jobs")
    public ApiResponse<Map<String, Object>> createJob(@RequestBody JobRequisitionRequestDTO dto) {
        try {
            recruitmentService.createJob(dto);
            return ApiResponse.success(Map.of("success", true, "message", "Job opening registered."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/candidates")
    public ApiResponse<List<Map<String, Object>>> getCandidates() {
        try {
            List<Map<String, Object>> result = recruitmentService.getCandidates(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PutMapping("/candidates/{id}/stage")
    public ApiResponse<Map<String, Object>> updateCandidateStage(@PathVariable String id, @RequestBody CandidateStageUpdateDTO dto) {
        try {
            recruitmentService.updateCandidateStage(id, dto);
            return ApiResponse.success(Map.of("success", true, "message", "Candidate pipeline stage updated."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/candidates/{id}")
    public ApiResponse<Map<String, Object>> deleteCandidate(@PathVariable String id) {
        try {
            recruitmentService.deleteCandidate(id);
            return ApiResponse.success(Map.of("success", true, "message", "Candidate application soft deleted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/apply")
    public ApiResponse<Map<String, Object>> applyToJob(@RequestBody Map<String, String> body) {
        if (body.get("jobId") == null || body.get("firstName") == null || body.get("lastName") == null || body.get("email") == null) {
            return ApiResponse.error(400, "Required candidate fields missing.");
        }
        try {
            recruitmentService.applyToJob(body);
            return ApiResponse.success(Map.of("success", true, "message", "Application submitted successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
