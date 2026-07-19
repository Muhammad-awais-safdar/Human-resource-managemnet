package com.awais.hr.module.contractor.service;

import java.util.List;
import java.util.Map;

public interface ContractorService {
    List<Map<String, Object>> getContractors();
    void addContractor(Map<String, Object> body);
    List<Map<String, Object>> getAgreements(String contractorId);
    void addAgreement(Map<String, Object> body);
    List<Map<String, Object>> getTimesheets(String contractorId);
    void submitTimesheet(Map<String, Object> body);
    void actionTimesheet(String timesheetId, String status);
}
