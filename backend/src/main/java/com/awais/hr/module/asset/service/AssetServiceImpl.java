package com.awais.hr.module.asset.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class AssetServiceImpl implements AssetService {

    private final DataSource dataSource;

    public AssetServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private String getEmployeeId(JdbcTemplate jdbcTemplate, String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
    }

    @Override
    public List<Map<String, Object>> getAllAssets() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return jdbcTemplate.queryForList(
                "SELECT a.id, a.name, a.category, a.serial_number, a.status, a.purchase_date, " +
                "e.first_name, e.last_name " +
                "FROM asset a LEFT JOIN employee e ON a.assigned_to = e.id " +
                "ORDER BY a.category, a.name"
        );
    }

    @Override
    public List<Map<String, Object>> getMyAssets(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = getEmployeeId(jdbcTemplate, email);
        return jdbcTemplate.queryForList(
                "SELECT id, name, category, serial_number, status, purchase_date " +
                "FROM asset WHERE assigned_to = ?",
                empId
        );
    }

    @Override
    public Map<String, Object> assignAsset(String assetId, String employeeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        int rows = jdbcTemplate.update(
                "UPDATE asset SET assigned_to = ?, status = 'ASSIGNED' WHERE id = ? AND status = 'AVAILABLE'",
                employeeId, assetId
        );
        if (rows == 0) {
            return Map.of("success", false, "message", "Asset not available or not found.");
        }
        return Map.of("success", true, "message", "Asset assigned successfully.");
    }

    @Override
    public Map<String, Object> returnAsset(String assetId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        int rows = jdbcTemplate.update(
                "UPDATE asset SET assigned_to = NULL, status = 'AVAILABLE' WHERE id = ?",
                assetId
        );
        if (rows == 0) {
            return Map.of("success", false, "message", "Asset not found.");
        }
        return Map.of("success", true, "message", "Asset returned successfully.");
    }

    @Override
    public void addAsset(String name, String category, String serialNumber, String purchaseDate) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update(
                "INSERT INTO asset (id, name, category, serial_number, status, purchase_date) VALUES (?, ?, ?, ?, 'AVAILABLE', CAST(? AS DATE))",
                UUID.randomUUID().toString(), name, category, serialNumber, purchaseDate
        );
    }
}
