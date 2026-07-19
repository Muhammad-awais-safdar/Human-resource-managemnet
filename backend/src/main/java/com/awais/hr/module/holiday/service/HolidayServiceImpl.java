package com.awais.hr.module.holiday.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class HolidayServiceImpl implements HolidayService {

    private final DataSource dataSource;

    public HolidayServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Cacheable(value = "holidays", key = "'all'")
    public List<Map<String, Object>> getHolidays() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> holidays = jdbcTemplate.queryForList("SELECT id, name, holiday_date, description FROM holiday");
        if (holidays.isEmpty()) {
            jdbcTemplate.update("INSERT INTO holiday (id, name, holiday_date, description) VALUES (?, 'New Year Day', '2026-01-01', 'First day of year holiday')", UUID.randomUUID().toString());
            jdbcTemplate.update("INSERT INTO holiday (id, name, holiday_date, description) VALUES (?, 'Labour Day', '2026-05-01', 'Workers orientation break holiday')", UUID.randomUUID().toString());
            holidays = jdbcTemplate.queryForList("SELECT id, name, holiday_date, description FROM holiday");
        }
        return holidays;
    }

    @Override
    @CacheEvict(value = {"holidays", "regional_holidays"}, allEntries = true)
    public void addHoliday(String name, String holidayDate, String description) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update(
            "INSERT INTO holiday (id, name, holiday_date, description) VALUES (?, ?, CAST(? AS DATE), ?)",
            UUID.randomUUID().toString(), name, holidayDate, description
        );
    }

    @Override
    @Cacheable(value = "regional_holidays", key = "#region")
    public List<Map<String, Object>> getRegionalHolidays(String region) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
            "SELECT h.id, h.name, h.holiday_date, h.description, rh.region " +
            "FROM holiday h JOIN regional_holiday rh ON h.id = rh.holiday_id " +
            "WHERE rh.region = ?",
            region
        );
    }
}

