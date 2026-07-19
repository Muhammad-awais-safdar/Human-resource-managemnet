package com.awais.hr.module.holiday.service;

import java.util.List;
import java.util.Map;

public interface HolidayService {
    List<Map<String, Object>> getHolidays();
    void addHoliday(String name, String holidayDate, String description);
    List<Map<String, Object>> getRegionalHolidays(String region);
}
