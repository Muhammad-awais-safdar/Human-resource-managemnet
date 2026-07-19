package com.awais.hr.module.attendance.service;

import com.awais.hr.module.attendance.dto.CheckInRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final DataSource dataSource;
    private final GeofenceService geofenceService;

    public AttendanceServiceImpl(DataSource dataSource, GeofenceService geofenceService) {
        this.dataSource = dataSource;
        this.geofenceService = geofenceService;
    }

    private boolean isSuperAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        return jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND r.name = 'SUPER_ADMIN')",
                Boolean.class, employeeId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAttendanceHistory(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT a.id, a.check_in, a.check_out, a.ip_address, a.latitude, a.longitude, a.status, a.deleted, " +
                    "e.first_name, e.last_name, e.email " +
                    "FROM attendance_record a JOIN employee e ON a.employee_id = e.id " +
                    "ORDER BY a.check_in DESC"
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT a.id, a.check_in, a.check_out, a.ip_address, a.latitude, a.longitude, a.status, " +
                    "e.first_name, e.last_name, e.email " +
                    "FROM attendance_record a JOIN employee e ON a.employee_id = e.id " +
                    "WHERE a.deleted = FALSE " +
                    "ORDER BY a.check_in DESC"
            );
        }
    }

    @Override
    public void checkIn(String email, CheckInRequestDTO dto, String ipAddress) {
        Double lat = dto.getLatitude();
        Double lon = dto.getLongitude();

        // Business Logic: Geofencing validation check using active database geofences (delegated to GeofenceService)
        if (lat != null && lon != null) {
            if (!geofenceService.isInsideGeofence(lat, lon)) {
                throw new IllegalArgumentException("Check-in failed: You are outside the authorized geofence boundary area.");
            }
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String employeeId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        List<Map<String, Object>> active = jdbcTemplate.queryForList(
                "SELECT id FROM attendance_record WHERE employee_id = ? AND check_out IS NULL LIMIT 1",
                employeeId
        );
        if (!active.isEmpty()) {
            throw new IllegalStateException("You are already checked in. Check out first.");
        }

        String recordId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO attendance_record (id, employee_id, check_in, ip_address, latitude, longitude, status) " +
                "VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, 'PRESENT')",
                recordId, employeeId, ipAddress, lat, lon
        );
    }

    @Override
    public void checkOut(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String employeeId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        List<Map<String, Object>> active = jdbcTemplate.queryForList(
                "SELECT id FROM attendance_record WHERE employee_id = ? AND check_out IS NULL LIMIT 1",
                employeeId
        );

        if (active.isEmpty()) {
            throw new IllegalStateException("No active check-in session found today.");
        }

        String recordId = (String) active.get(0).get("id");
        jdbcTemplate.update(
                "UPDATE attendance_record SET check_out = CURRENT_TIMESTAMP WHERE id = ?",
                recordId
        );
    }

    @Override
    public void deleteAttendance(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE attendance_record SET deleted = TRUE WHERE id = ?", id);
    }
}
