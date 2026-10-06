package com.awais.hr.module.performance.service;

import com.awais.hr.module.performance.dto.GoalProgressUpdateDTO;
import java.util.List;
import java.util.Map;

public interface PerformanceService {
    List<Map<String, Object>> getGoals(String email);
    void updateGoalProgress(String id, GoalProgressUpdateDTO dto);
    void createGoal(String email, String title, int targetValue);
    void submitPeerFeedback(String email, String targetEmployeeId, String feedback, int rating);
    List<Map<String, Object>> getPeerFeedback(String email);

    // 360-Degree Performance Appraisal Workflow Methods
    Map<String, Object> startReviewCycle(String title, String period, String startDate, String endDate, String hrEmail);
    List<Map<String, Object>> getAppraisals(String email);
    void submitSelfAppraisal(String appraisalId, int rating, String summary, String userEmail);
    void submitManagerEvaluation(String appraisalId, int rating, String summary, String managerEmail);
    void calibrateAppraisal(String appraisalId, int calibratedRating, String hrEmail);
    void acknowledgeAppraisal(String appraisalId, String employeeEmail);
}
