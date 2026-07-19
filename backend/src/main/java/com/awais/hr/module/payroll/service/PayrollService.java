package com.awais.hr.module.payroll.service;

import java.util.List;
import java.util.Map;

public interface PayrollService {
    List<Map<String, Object>> getPayslips(String email);
    Map<String, Object> runPayroll(String email);
    List<Map<String, Object>> getAllPayslips();
}
