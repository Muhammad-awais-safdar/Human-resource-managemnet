package com.awais.hr.module.document.service;

import com.awais.hr.module.document.dto.DocumentUploadRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DataSource dataSource;

    public DocumentServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDocuments(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        return jdbcTemplate.queryForList(
                "SELECT id, name, document_url, uploaded_at, expiry_date, signed, signature_data FROM document_record WHERE employee_id = ? ORDER BY uploaded_at DESC",
                empId
        );
    }

    @Override
    public void uploadDocument(String email, DocumentUploadRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        java.time.LocalDate expiry = dto.getExpiryDate() != null && !dto.getExpiryDate().trim().isEmpty()
                ? java.time.LocalDate.parse(dto.getExpiryDate().trim()) 
                : null;

        jdbcTemplate.update(
                "INSERT INTO document_record (id, employee_id, name, document_url, expiry_date, signed) VALUES (?, ?, ?, ?, CAST(? AS DATE), FALSE)",
                UUID.randomUUID().toString(), empId, dto.getName(), dto.getUrl(), expiry
        );
    }

    @Override
    public void signDocument(String documentId, String signatureData) {
        if (signatureData == null || signatureData.trim().isEmpty()) {
            throw new IllegalArgumentException("Signature data cannot be blank.");
        }
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update(
                "UPDATE document_record SET signed = TRUE, signature_data = ? WHERE id = ?",
                signatureData, documentId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExpiredDocuments() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT id, name, document_url, expiry_date, employee_id FROM document_record WHERE expiry_date < CURRENT_DATE ORDER BY expiry_date ASC"
        );
    }
}
