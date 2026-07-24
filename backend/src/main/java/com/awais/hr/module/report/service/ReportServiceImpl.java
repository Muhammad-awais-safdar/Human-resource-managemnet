package com.awais.hr.module.report.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportServiceImpl.class);
    private final DataSource dataSource;

    public ReportServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getReportDefinitions() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList(
                "SELECT id, name, description, format, module, created_at " +
                "FROM report_definition WHERE deleted = FALSE ORDER BY module, name"
        );
    }

    @Override
    public void createReportDefinition(String email, String name, String description,
                                        String queryTemplate, String parametersJson,
                                        String format, String module) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Report name is required.");
        if (queryTemplate == null || queryTemplate.isBlank()) throw new IllegalArgumentException("Query template is required.");

        String createdById = jdbc.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        String fmt = format != null ? format.toUpperCase().trim() : "CSV";
        String mod = module != null ? module.toUpperCase().trim() : "GENERAL";

        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO report_definition (id, name, description, query_template, parameters_json, format, module, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id, name.trim(), description, queryTemplate.trim(), parametersJson, fmt, mod, createdById
        );
        log.info("Report definition created: id={} name={} format={} module={}", id, name, fmt, mod);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> runReport(String reportId, Map<String, Object> parameters) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Map<String, Object> def = jdbc.queryForMap(
                "SELECT query_template FROM report_definition WHERE id = ? AND deleted = FALSE",
                reportId
        );
        String queryTemplate = (String) def.get("query_template");

        // Security: only allow SELECT statements — block DDL/DML abuse
        String trimmedQuery = queryTemplate.trim().toUpperCase();
        if (!trimmedQuery.startsWith("SELECT")) {
            throw new SecurityException("Report query must be a SELECT statement only.");
        }
        // ACID-safe: bind parameters positionally
        List<Object> args = new ArrayList<>();
        if (parameters != null) {
            // Replace named parameters like :param_name with values from parameters map
            for (Map.Entry<String, Object> entry : parameters.entrySet()) {
                String placeholder = ":" + entry.getKey();
                if (queryTemplate.contains(placeholder)) {
                    queryTemplate = queryTemplate.replace(placeholder, "?");
                    args.add(entry.getValue());
                }
            }
        }
        log.info("Executing report: id={}", reportId);
        return jdbc.queryForList(queryTemplate, args.toArray());
    }

    @Override
    @Transactional(readOnly = true)
    public String exportReportCsv(String reportId, Map<String, Object> parameters) {
        List<Map<String, Object>> rows = runReport(reportId, parameters);
        if (rows.isEmpty()) return "";

        StringBuilder csv = new StringBuilder();
        // Header row from first row keys
        List<String> headers = new ArrayList<>(rows.get(0).keySet());
        csv.append(String.join(",", headers)).append("\n");
        for (Map<String, Object> row : rows) {
            List<String> values = new ArrayList<>();
            for (String col : headers) {
                Object val = row.get(col);
                String cell = val == null ? "" : val.toString().replace("\"", "\"\"");
                // Quote cells that contain comma or newline
                if (cell.contains(",") || cell.contains("\n")) {
                    cell = "\"" + cell + "\"";
                }
                values.add(cell);
            }
            csv.append(String.join(",", values)).append("\n");
        }
        log.info("CSV export generated: reportId={} rows={}", reportId, rows.size());
        return csv.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardMetrics(String email) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        long totalEmployees = 0L;
        try {
            totalEmployees = Optional.ofNullable(jdbc.queryForObject(
                    "SELECT COUNT(1) FROM employee WHERE status = 'ACTIVE'", Long.class)).orElse(0L);
        } catch (Exception e) {
            log.warn("Failed to fetch totalEmployees metric: {}", e.getMessage());
        }

        long openLeaves = 0L;
        try {
            openLeaves = Optional.ofNullable(jdbc.queryForObject(
                    "SELECT COUNT(1) FROM leave_request WHERE status = 'PENDING' AND deleted = FALSE", Long.class)).orElse(0L);
        } catch (Exception e) {
            log.warn("Failed to fetch openLeaves metric: {}", e.getMessage());
        }

        long openTickets = 0L;
        try {
            openTickets = Optional.ofNullable(jdbc.queryForObject(
                    "SELECT COUNT(1) FROM support_ticket WHERE status = 'OPEN' AND deleted = FALSE", Long.class)).orElse(0L);
        } catch (Exception e) {
            log.warn("Failed to fetch openTickets metric: {}", e.getMessage());
        }

        long pendingExpenses = 0L;
        try {
            pendingExpenses = Optional.ofNullable(jdbc.queryForObject(
                    "SELECT COUNT(1) FROM expense_claim WHERE status = 'PENDING' AND deleted = FALSE", Long.class)).orElse(0L);
        } catch (Exception e) {
            log.warn("Failed to fetch pendingExpenses metric: {}", e.getMessage());
        }

        return Map.of(
                "totalEmployees", totalEmployees,
                "openLeaveRequests", openLeaves,
                "openSupportTickets", openTickets,
                "pendingExpenseClaims", pendingExpenses
        );
    }
}
