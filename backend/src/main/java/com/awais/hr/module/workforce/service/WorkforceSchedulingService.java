package com.awais.hr.module.workforce.service;

import java.util.List;
import java.util.Map;

public interface WorkforceSchedulingService {
    List<Map<String, Object>> getSchedules(String email);
    void createSchedule(Map<String, Object> body);
    List<Map<String, Object>> getOpenShifts();
    void createOpenShift(Map<String, Object> body);
    void bidOnShift(String email, String openShiftId);
    void actionBid(String bidId, String status);
}
