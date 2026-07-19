package com.awais.hr.module.succession.service;

import java.util.List;
import java.util.Map;

public interface SuccessionService {
    List<Map<String, Object>> getPositions();
    List<Map<String, Object>> getSuccessionPlans();
    void addPosition(Map<String, Object> body);
    void addSuccessorToPlan(Map<String, Object> body);
    List<Map<String, Object>> getTalentPools();
    void addTalentPool(Map<String, Object> body);
    void addMemberToPool(Map<String, Object> body);
}
