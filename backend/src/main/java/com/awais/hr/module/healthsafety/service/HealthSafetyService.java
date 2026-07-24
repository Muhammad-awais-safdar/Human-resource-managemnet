package com.awais.hr.module.healthsafety.service;

import java.util.List;
import java.util.Map;

public interface HealthSafetyService {
    List<Map<String, Object>> getIncidents();
    Map<String, Object> reportIncident(Map<String, Object> body);
    List<Map<String, Object>> getPpeAssignments();
    Map<String, Object> assignPpe(Map<String, Object> body);
}
