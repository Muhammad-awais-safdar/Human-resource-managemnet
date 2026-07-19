package com.awais.hr.module.workforce.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class WorkforceSchedulingServiceImpl implements WorkforceSchedulingService {

    private final DataSource dataSource;

    public WorkforceSchedulingServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Map<String, Object>> getSchedules(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = jdbc.queryForObject(
            "SELECT id FROM employee WHERE email = ?", String.class, email
        );
        return jdbc.queryForList(
            "SELECT ws.id, ws.schedule_date, ws.start_time, ws.end_time, ws.status, " +
            "e.first_name, e.last_name, e.email " +
            "FROM workforce_schedule ws " +
            "JOIN employee e ON ws.employee_id = e.id " +
            "WHERE ws.employee_id = ? " +
            "ORDER BY ws.schedule_date DESC",
            employeeId
        );
    }

    @Override
    public void createSchedule(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO workforce_schedule (id, employee_id, schedule_date, start_time, end_time, status) " +
            "VALUES (?, ?, CAST(? AS DATE), CAST(? AS TIME), CAST(? AS TIME), ?)",
            id,
            body.get("employeeId"),
            body.get("scheduleDate"),
            body.get("startTime"),
            body.get("endTime"),
            body.getOrDefault("status", "SCHEDULED")
        );
    }

    @Override
    public List<Map<String, Object>> getOpenShifts() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT id, department_id, shift_date, start_time, end_time, required_count, status, created_at " +
            "FROM open_shift ORDER BY shift_date DESC"
        );
    }

    @Override
    public void createOpenShift(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO open_shift (id, department_id, shift_date, start_time, end_time, required_count, status) " +
            "VALUES (?, ?, CAST(? AS DATE), CAST(? AS TIME), CAST(? AS TIME), ?, ?)",
            id,
            body.get("departmentId"),
            body.get("shiftDate"),
            body.get("startTime"),
            body.get("endTime"),
            Integer.parseInt(String.valueOf(body.getOrDefault("requiredCount", 1))),
            body.getOrDefault("status", "OPEN")
        );
    }

    @Override
    public void bidOnShift(String email, String openShiftId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String employeeId = jdbc.queryForObject(
            "SELECT id FROM employee WHERE email = ?", String.class, email
        );
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO shift_bid (id, open_shift_id, employee_id) VALUES (?, ?, ?) " +
            "ON CONFLICT (open_shift_id, employee_id) DO NOTHING",
            id, openShiftId, employeeId
        );
    }

    @Override
    public void actionBid(String bidId, String status) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update(
            "UPDATE shift_bid SET status = ? WHERE id = ?",
            status, bidId
        );
        
        if ("APPROVED".equals(status)) {
            // Assign the employee to the actual schedule automatically on approval
            Map<String, Object> bidInfo = jdbc.queryForMap(
                "SELECT sb.employee_id, os.shift_date, os.start_time, os.end_time " +
                "FROM shift_bid sb JOIN open_shift os ON sb.open_shift_id = os.id " +
                "WHERE sb.id = ?",
                bidId
            );
            
            String scheduleId = UUID.randomUUID().toString();
            jdbc.update(
                "INSERT INTO workforce_schedule (id, employee_id, schedule_date, start_time, end_time, status) " +
                "VALUES (?, ?, ?, ?, ?, 'SCHEDULED') " +
                "ON CONFLICT (employee_id, schedule_date) DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time",
                scheduleId,
                bidInfo.get("employee_id"),
                bidInfo.get("shift_date"),
                bidInfo.get("start_time"),
                bidInfo.get("end_time")
            );
        }
    }
}
