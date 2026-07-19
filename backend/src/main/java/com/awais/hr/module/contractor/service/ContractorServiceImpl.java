package com.awais.hr.module.contractor.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class ContractorServiceImpl implements ContractorService {

    private final DataSource dataSource;

    public ContractorServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Map<String, Object>> getContractors() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT id, full_name, email, vendor_company, hourly_rate, currency, status, start_date, end_date, created_at " +
            "FROM contractor ORDER BY full_name ASC"
        );
    }

    @Override
    public void addContractor(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        BigDecimal hourlyRate = new BigDecimal(String.valueOf(body.getOrDefault("hourlyRate", 0)));
        jdbc.update(
            "INSERT INTO contractor (id, full_name, email, vendor_company, hourly_rate, currency, start_date, end_date) " +
            "VALUES (?, ?, ?, ?, ?, ?, CAST(? AS DATE), CAST(? AS DATE))",
            id,
            body.get("fullName"),
            body.get("email"),
            body.getOrDefault("vendorCompany", null),
            hourlyRate,
            body.getOrDefault("currency", "USD"),
            body.getOrDefault("startDate", null),
            body.getOrDefault("endDate", null)
        );
    }

    @Override
    public List<Map<String, Object>> getAgreements(String contractorId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT id, contractor_id, document_name, document_url, start_date, end_date, status, created_at " +
            "FROM contractor_agreement WHERE contractor_id = ? ORDER BY start_date DESC",
            contractorId
        );
    }

    @Override
    public void addAgreement(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
            "INSERT INTO contractor_agreement (id, contractor_id, document_name, document_url, start_date, end_date) " +
            "VALUES (?, ?, ?, ?, CAST(? AS DATE), CAST(? AS DATE))",
            id,
            body.get("contractorId"),
            body.get("documentName"),
            body.getOrDefault("documentUrl", null),
            body.get("startDate"),
            body.getOrDefault("endDate", null)
        );
    }

    @Override
    public List<Map<String, Object>> getTimesheets(String contractorId) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
            "SELECT id, contractor_id, week_start_date, hours_logged, description, status, submitted_at " +
            "FROM contractor_timesheet WHERE contractor_id = ? ORDER BY week_start_date DESC",
            contractorId
        );
    }

    @Override
    public void submitTimesheet(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        BigDecimal hoursLogged = new BigDecimal(String.valueOf(body.getOrDefault("hoursLogged", 0)));
        if (hoursLogged.compareTo(BigDecimal.ZERO) < 0 || hoursLogged.compareTo(new BigDecimal("168")) > 0) {
            throw new IllegalArgumentException("Invalid logged hours range.");
        }
        jdbc.update(
            "INSERT INTO contractor_timesheet (id, contractor_id, week_start_date, hours_logged, description) " +
            "VALUES (?, ?, CAST(? AS DATE), ?, ?) " +
            "ON CONFLICT (contractor_id, week_start_date) DO UPDATE SET hours_logged = EXCLUDED.hours_logged, description = EXCLUDED.description, status = 'PENDING'",
            id,
            body.get("contractorId"),
            body.get("weekStartDate"),
            hoursLogged,
            body.getOrDefault("description", null)
        );
    }

    @Override
    public void actionTimesheet(String timesheetId, String status) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update(
            "UPDATE contractor_timesheet SET status = ? WHERE id = ?",
            status, timesheetId
        );
    }
}
