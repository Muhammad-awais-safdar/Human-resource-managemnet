package com.awais.hr.module.shift.service;

import java.util.List;
import java.util.Map;

public interface ShiftService {
    List<Map<String, Object>> getShifts();
    void assignShift(String employeeId, String shiftId, String date);
    void swapShift(String firstEmployeeId, String secondEmployeeId, String date);
}
