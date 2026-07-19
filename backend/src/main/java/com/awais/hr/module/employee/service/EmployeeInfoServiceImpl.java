package com.awais.hr.module.employee.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class EmployeeInfoServiceImpl implements EmployeeInfoService {

    private final DataSource dataSource;

    public EmployeeInfoServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeIdByEmail(JdbcTemplate jdbcTemplate, String email) {
        try {
            return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public Map<String, Object> getEmployeeInfo(String employeeIdOrEmail) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String employeeId = employeeIdOrEmail;
        if (employeeIdOrEmail.contains("@")) {
            employeeId = getEmployeeIdByEmail(jdbcTemplate, employeeIdOrEmail);
        }

        if (employeeId == null) {
            throw new IllegalArgumentException("Employee profile not found");
        }
        
        // 1. Query basic employee fields
        Map<String, Object> employee = jdbcTemplate.queryForMap(
                "SELECT id, employee_code, first_name, last_name, email, custom_metadata FROM employee WHERE id = ?",
                employeeId
        );
        
        // 2. Query passport
        List<Map<String, Object>> passportList = jdbcTemplate.queryForList(
                "SELECT passport_number, issue_date, expiry_date, place_of_issue FROM employee_passport WHERE employee_id = ?",
                employeeId
        );
        Map<String, Object> passport = !passportList.isEmpty() ? passportList.get(0) : new HashMap<>();
        
        // 3. Query visa
        List<Map<String, Object>> visaList = jdbcTemplate.queryForList(
                "SELECT visa_number, visa_type, expiry_date, entry_type FROM employee_visa WHERE employee_id = ?",
                employeeId
        );
        Map<String, Object> visa = !visaList.isEmpty() ? visaList.get(0) : new HashMap<>();
        
        Map<String, Object> result = new HashMap<>();
        result.put("employee", employee);
        result.put("passport", passport);
        result.put("visa", visa);
        
        return result;
    }

    @Override
    public void updateEmployeeInfo(String employeeIdOrEmail, Map<String, Object> info) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String employeeId = employeeIdOrEmail;
        if (employeeIdOrEmail.contains("@")) {
            employeeId = getEmployeeIdByEmail(jdbcTemplate, employeeIdOrEmail);
        }

        if (employeeId == null) {
            throw new IllegalArgumentException("Employee profile not found");
        }
        
        // 1. Update basic fields
        Map<String, Object> empDetails = (Map<String, Object>) info.get("employee");
        if (empDetails != null) {
            String firstName = (String) empDetails.get("firstName");
            String lastName = (String) empDetails.get("lastName");
            String customMetadata = (String) empDetails.get("customMetadata");
            
            jdbcTemplate.update(
                    "UPDATE employee SET first_name = ?, last_name = ?, custom_metadata = CAST(? AS jsonb), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    firstName, lastName, customMetadata, employeeId
            );
        }
        
        // 2. Update/Insert passport
        Map<String, Object> passportDetails = (Map<String, Object>) info.get("passport");
        if (passportDetails != null && passportDetails.get("passportNumber") != null && !((String)passportDetails.get("passportNumber")).trim().isEmpty()) {
            String passportNumber = (String) passportDetails.get("passportNumber");
            String issueDateStr = (String) passportDetails.get("issueDate");
            String expiryDateStr = (String) passportDetails.get("expiryDate");
            String placeOfIssue = (String) passportDetails.get("placeOfIssue");
            
            java.sql.Date issueDate = (issueDateStr != null && !issueDateStr.trim().isEmpty()) ? java.sql.Date.valueOf(issueDateStr) : null;
            java.sql.Date expiryDate = (expiryDateStr != null && !expiryDateStr.trim().isEmpty()) ? java.sql.Date.valueOf(expiryDateStr) : null;
            
            Boolean passportExists = jdbcTemplate.queryForObject(
                    "SELECT EXISTS(SELECT 1 FROM employee_passport WHERE employee_id = ?)",
                    Boolean.class, employeeId
            );
            
            if (passportExists != null && passportExists) {
                jdbcTemplate.update(
                        "UPDATE employee_passport SET passport_number = ?, issue_date = ?, expiry_date = ?, place_of_issue = ?, updated_at = CURRENT_TIMESTAMP WHERE employee_id = ?",
                        passportNumber, issueDate, expiryDate, placeOfIssue, employeeId
                );
            } else {
                jdbcTemplate.update(
                        "INSERT INTO employee_passport (id, employee_id, passport_number, issue_date, expiry_date, place_of_issue) VALUES (?, ?, ?, ?, ?, ?)",
                        UUID.randomUUID().toString(), employeeId, passportNumber, issueDate, expiryDate, placeOfIssue
                );
            }
        }
        
        // 3. Update/Insert visa
        Map<String, Object> visaDetails = (Map<String, Object>) info.get("visa");
        if (visaDetails != null && visaDetails.get("visaNumber") != null && !((String)visaDetails.get("visaNumber")).trim().isEmpty()) {
            String visaNumber = (String) visaDetails.get("visaNumber");
            String visaType = (String) visaDetails.get("visaType");
            String expiryDateStr = (String) visaDetails.get("expiryDate");
            String entryType = (String) visaDetails.get("entryType");
            
            java.sql.Date expiryDate = (expiryDateStr != null && !expiryDateStr.trim().isEmpty()) ? java.sql.Date.valueOf(expiryDateStr) : null;
            
            Boolean visaExists = jdbcTemplate.queryForObject(
                    "SELECT EXISTS(SELECT 1 FROM employee_visa WHERE employee_id = ?)",
                    Boolean.class, employeeId
            );
            
            if (visaExists != null && visaExists) {
                jdbcTemplate.update(
                        "UPDATE employee_visa SET visa_number = ?, visa_type = ?, expiry_date = ?, entry_type = ?, updated_at = CURRENT_TIMESTAMP WHERE employee_id = ?",
                        visaNumber, visaType, expiryDate, entryType, employeeId
                );
            } else {
                jdbcTemplate.update(
                        "INSERT INTO employee_visa (id, employee_id, visa_number, visa_type, expiry_date, entry_type) VALUES (?, ?, ?, ?, ?, ?)",
                        UUID.randomUUID().toString(), employeeId, visaNumber, visaType, expiryDate, entryType
                );
            }
        }
    }
}
