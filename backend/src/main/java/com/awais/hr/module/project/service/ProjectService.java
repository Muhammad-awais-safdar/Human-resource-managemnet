package com.awais.hr.module.project.service;

import com.awais.hr.module.project.dto.TimesheetLogRequestDTO;
import java.util.List;
import java.util.Map;

public interface ProjectService {
    List<Map<String, Object>> getProjects();
    void submitTimesheet(String email, TimesheetLogRequestDTO dto);
    void allocateResource(String projectId, String employeeId, String role);
    List<Map<String, Object>> getTimesheets(String email);
    void approveTimesheet(String timesheetId, String email);
    void rejectTimesheet(String timesheetId, String email);
}
