package com.awais.hr.engine.roster;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Service
public class RosterEngine {

    private final DataSource dataSource;

    public RosterEngine(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public String createOpenShift(LocalDate shiftDate, String startTime, String endTime, String department, String requiredQualification) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO roster_shift_market (id, shift_date, start_time, end_time, department, required_qualification, shift_status) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'OPEN')",
                id, Date.valueOf(shiftDate), startTime, endTime, department, requiredQualification
        );
        return id;
    }

    public boolean requestShiftSwap(String shiftId, String requesterId, String targetEmployeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        int updated = jdbcTemplate.update(
                "UPDATE roster_shift_market SET shift_status = 'SWAPPED', trade_offered_by_id = ?, trade_claimed_by_id = ?, supervisor_approval = 'PENDING' " +
                "WHERE id = ?",
                requesterId, targetEmployeeId, shiftId
        );
        return updated > 0;
    }

    public List<Map<String, Object>> getOpenShifts(String department) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, shift_date, start_time, end_time, department, required_qualification, shift_status " +
                "FROM roster_shift_market WHERE department = ? AND shift_status IN ('OPEN', 'BIDDING') ORDER BY shift_date ASC",
                department
        );
    }
}
