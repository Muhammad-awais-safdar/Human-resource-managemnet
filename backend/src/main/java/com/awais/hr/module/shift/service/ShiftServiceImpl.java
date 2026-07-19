package com.awais.hr.module.shift.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ShiftServiceImpl implements ShiftService {

    private final DataSource dataSource;

    public ShiftServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Map<String, Object>> getShifts() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT es.work_date, ss.id as shift_id, ss.name, ss.start_time, ss.end_time, e.id as employee_id, e.first_name, e.last_name " +
                "FROM employee_shift es JOIN shift_schedule ss ON es.shift_id = ss.id JOIN employee e ON es.employee_id = e.id"
        );
    }

    @Override
    public void assignShift(String employeeId, String shiftId, String date) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        java.sql.Date sqlDate = java.sql.Date.valueOf(date);
        
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_shift WHERE employee_id = ? AND work_date = ?)",
                Boolean.class, employeeId, sqlDate
        );
        if (exists != null && exists) {
            throw new IllegalArgumentException("Scheduling Collision: Employee already has an active shift on " + date);
        }
        
        jdbcTemplate.update(
                "INSERT INTO employee_shift (employee_id, shift_id, work_date) VALUES (?, ?, ?)",
                employeeId, shiftId, sqlDate
        );
    }

    @Override
    public void swapShift(String firstEmployeeId, String secondEmployeeId, String date) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        java.sql.Date sqlDate = java.sql.Date.valueOf(date);
        
        List<String> firstShifts = jdbcTemplate.query(
                "SELECT shift_id FROM employee_shift WHERE employee_id = ? AND work_date = ?",
                (rs, rowNum) -> rs.getString("shift_id"),
                firstEmployeeId, sqlDate
        );
        
        List<String> secondShifts = jdbcTemplate.query(
                "SELECT shift_id FROM employee_shift WHERE employee_id = ? AND work_date = ?",
                (rs, rowNum) -> rs.getString("shift_id"),
                secondEmployeeId, sqlDate
        );
        
        if (firstShifts.isEmpty() || secondShifts.isEmpty()) {
            throw new IllegalArgumentException("Both employees must be assigned to active shifts on " + date + " to perform swap.");
        }
        
        String firstShiftId = firstShifts.get(0);
        String secondShiftId = secondShifts.get(0);
        
        if (firstShiftId.equals(secondShiftId)) {
            throw new IllegalArgumentException("Employees are already on the same shift roster.");
        }
        
        jdbcTemplate.update(
                "UPDATE employee_shift SET shift_id = ? WHERE employee_id = ? AND work_date = ?",
                secondShiftId, firstEmployeeId, sqlDate
        );
        jdbcTemplate.update(
                "UPDATE employee_shift SET shift_id = ? WHERE employee_id = ? AND work_date = ?",
                firstShiftId, secondEmployeeId, sqlDate
        );
    }
}
