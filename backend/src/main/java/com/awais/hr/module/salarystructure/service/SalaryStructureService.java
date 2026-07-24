package com.awais.hr.module.salarystructure.service;

import java.util.List;
import java.util.Map;

public interface SalaryStructureService {
    List<Map<String, Object>> getComponents();
    Map<String, Object> createComponent(Map<String, Object> body);
    List<Map<String, Object>> getTemplates();
}
