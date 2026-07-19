package com.awais.hr.module.employee.service;

import java.util.Map;

public interface EmployeeInfoService {
    Map<String, Object> getEmployeeInfo(String employeeId);
    void updateEmployeeInfo(String employeeId, Map<String, Object> info);
}
