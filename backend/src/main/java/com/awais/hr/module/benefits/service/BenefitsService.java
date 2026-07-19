package com.awais.hr.module.benefits.service;

import java.util.List;
import java.util.Map;

public interface BenefitsService {
    List<Map<String, Object>> getPlans();
    void addPlan(Map<String, Object> body);
    List<Map<String, Object>> getMyEnrollments(String email);
    List<Map<String, Object>> getAllEnrollments();
    void enroll(String email, String planId);
    void unenroll(String email, String planId);
}
