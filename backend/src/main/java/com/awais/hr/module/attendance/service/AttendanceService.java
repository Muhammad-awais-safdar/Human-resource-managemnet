package com.awais.hr.module.attendance.service;

import com.awais.hr.module.attendance.dto.CheckInRequestDTO;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
    List<Map<String, Object>> getAttendanceHistory(String email);
    void checkIn(String email, CheckInRequestDTO dto, String ipAddress);
    void checkOut(String email);
    void deleteAttendance(String id);
}
