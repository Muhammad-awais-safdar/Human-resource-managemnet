package com.awais.hr.module.visitor.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class VisitorServiceImpl implements VisitorService {

    private static final Logger log = LoggerFactory.getLogger(VisitorServiceImpl.class);
    private final DataSource dataSource;

    public VisitorServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getVisitors() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, visitor_name, email, phone, company, host_employee_id, purpose, qr_pass_code, check_in_time, check_out_time, status, security_clearance, created_at " +
                "FROM visitor_log ORDER BY created_at DESC"
        );
    }

    @Override
    public Map<String, Object> registerVisitor(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("visitorName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Visitor name is required.");
        }
        String email = (String) body.get("email");
        String phone = (String) body.get("phone");
        String company = (String) body.get("company");
        String hostEmployeeId = (String) body.get("hostEmployeeId");
        String purpose = (String) body.get("purpose");

        String id = UUID.randomUUID().toString();
        String qrPassCode = "QR-VIS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        jdbc.update(
                "INSERT INTO visitor_log (id, visitor_name, email, phone, company, host_employee_id, purpose, qr_pass_code, status, security_clearance) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PASSED')",
                id, name.trim(), email, phone, company, hostEmployeeId, purpose, qrPassCode
        );
        log.info("Visitor registered: id={} name={} pass={}", id, name, qrPassCode);
        return Map.of("id", id, "visitorName", name, "qrPassCode", qrPassCode, "status", "PENDING");
    }

    @Override
    public Map<String, Object> checkInVisitor(String visitorId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update(
                "UPDATE visitor_log SET check_in_time = NOW(), status = 'CHECKED_IN' WHERE id = ?", visitorId
        );
        log.info("Visitor checked in: id={}", visitorId);
        return Map.of("id", visitorId, "status", "CHECKED_IN");
    }

    @Override
    public Map<String, Object> checkOutVisitor(String visitorId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update(
                "UPDATE visitor_log SET check_out_time = NOW(), status = 'CHECKED_OUT' WHERE id = ?", visitorId
        );
        log.info("Visitor checked out: id={}", visitorId);
        return Map.of("id", visitorId, "status", "CHECKED_OUT");
    }

    @Override
    public Map<String, Object> updateVisitorStatus(String visitorId, String status) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update(
                "UPDATE visitor_log SET status = ? WHERE id = ?", status.toUpperCase(), visitorId
        );
        return Map.of("id", visitorId, "status", status.toUpperCase());
    }
}
