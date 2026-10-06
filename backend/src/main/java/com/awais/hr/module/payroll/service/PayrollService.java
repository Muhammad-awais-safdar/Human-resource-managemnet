package com.awais.hr.module.payroll.service;

import java.util.List;
import java.util.Map;

public interface PayrollService {
    List<Map<String, Object>> getPayslips(String email);
    Map<String, Object> runPayroll(String email);
    List<Map<String, Object>> getAllPayslips();

    // Payroll Workflow State Machine & Locking Methods
    Map<String, Object> initiatePayrollRun(String payPeriod, String initiatorEmail);
    Map<String, Object> approvePayrollRun(String payrollRunId, String approverEmail);
    List<Map<String, Object>> getPayrollRuns();
    Map<String, Object> getPayrollRunDetails(String payrollRunId);
}
