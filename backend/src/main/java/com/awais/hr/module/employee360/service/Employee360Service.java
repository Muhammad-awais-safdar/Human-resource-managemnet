package com.awais.hr.module.employee360.service;

import java.util.List;
import java.util.Map;

public interface Employee360Service {
    Map<String, Object> get360Profile(String employeeId);
    Map<String, Object> addManagerNote(Map<String, Object> body);
}
