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
}
