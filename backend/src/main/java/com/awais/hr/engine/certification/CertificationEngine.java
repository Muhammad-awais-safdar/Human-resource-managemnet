package com.awais.hr.engine.certification;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Service
public class CertificationEngine {

    private final DataSource dataSource;

    public CertificationEngine(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public String registerCertification(String employeeId, String certName, String certType, String authority, String licenseNum, LocalDate expiryDate) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO certification_registry (id, employee_id, certification_name, credential_type, authority_name, license_number, expiry_date, verification_status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, 'VERIFIED')",
                id, employeeId, certName, certType, authority, licenseNum, Date.valueOf(expiryDate)
        );
        return id;
    }

    public List<Map<String, Object>> getEmployeeCertifications(String employeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, certification_name, credential_type, authority_name, license_number, expiry_date, verification_status " +
                "FROM certification_registry WHERE employee_id = ? ORDER BY expiry_date ASC",
                employeeId
        );
    }

    public boolean validateActiveQualification(String employeeId, String requiredCertType) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM certification_registry " +
                "WHERE employee_id = ? AND UPPER(credential_type) = UPPER(?) AND expiry_date >= CURRENT_DATE AND verification_status = 'VERIFIED'",
                Integer.class, employeeId, requiredCertType
        );
        return count != null && count > 0;
    }
}
