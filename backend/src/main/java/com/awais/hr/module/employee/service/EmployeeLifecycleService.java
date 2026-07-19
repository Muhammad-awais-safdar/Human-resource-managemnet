package com.awais.hr.module.employee.service;

import com.awais.hr.module.employee.dto.ClearanceApprovalRequestDTO;
import com.awais.hr.module.employee.dto.TimelineEventRequestDTO;
import java.util.List;
import java.util.Map;

public interface EmployeeLifecycleService {
    List<Map<String, Object>> getTimeline();
    void addTimelineEvent(TimelineEventRequestDTO dto);
    List<Map<String, Object>> getExitClearances();
    void approveClearance(ClearanceApprovalRequestDTO dto);
    List<Map<String, Object>> listEmployees();
    void initiateClearance(String employeeId);
    String inviteEmployee(String employeeCode, String firstName, String lastName, String email, String roleId);
    void updateEmployeeRole(String employeeId, String roleId);
    Map<String, Object> getEmployee360(String employeeId);
}



